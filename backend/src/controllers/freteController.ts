import { Request, Response } from 'express';
import axios from 'axios';
import pool from '../config/db';

export const getCotacoes = async (req: Request, res: Response) => {
    try {
        const query = `
            SELECT c.cotacao_id, c.destinatario, c.cep_destino, c.status, c.data_criacao, e.nome_fantasia as empresa_origem
            FROM cotacoes c
            JOIN empresas e ON c.empresa_origem_id = e.empresa_id
            ORDER BY c.data_criacao DESC;
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar cotações." });
    }
};

export const getCotacaoById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const cotacaoRes = await pool.query('SELECT * FROM cotacoes WHERE cotacao_id = $1', [id]);
        if (cotacaoRes.rowCount === 0) {
            return res.status(404).json({ message: "Cotação não encontrada" });
        }

        const resultadosRes = await pool.query('SELECT * FROM cotacao_resultados WHERE cotacao_id = $1 ORDER BY preco ASC', [id]);
        
        const cotacao = cotacaoRes.rows[0];
        cotacao.resultados = resultadosRes.rows;

        res.json(cotacao);
    } catch (error) {
        console.error("Erro ao buscar detalhes da cotação:", error);
        res.status(500).json({ message: "Erro ao buscar detalhes da cotação." });
    }
};

export const createCotacao = async (req: Request, res: Response) => {
    const { empresa_origem_id, cep_destino, itens, destinatario } = req.body;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const cotacaoRes = await client.query(
            'INSERT INTO cotacoes (empresa_origem_id, cep_destino, status, destinatario) VALUES ($1, $2, $3, $4) RETURNING *',
            [empresa_origem_id, cep_destino, 'PROCESSANDO', destinatario]
        );
        const novaCotacao = cotacaoRes.rows[0];

        const produtoIds = itens.map((item: any) => item.produto_id);
        const produtosRes = await client.query('SELECT * FROM produtos WHERE produto_id = ANY($1::int[])', [produtoIds]);
        const empresaRes = await client.query('SELECT cep FROM empresas WHERE empresa_id = $1', [empresa_origem_id]);
        
        const produtosMap = new Map(produtosRes.rows.map((p: any) => [p.produto_id, p]));

        const requestBody = {
            from: { postal_code: empresaRes.rows[0].cep.replace(/\D/g, '') },
            to: { postal_code: cep_destino.replace(/\D/g, '') }, // <-- CORREÇÃO AQUI
            products: itens.map((item: any) => {
                const produto = produtosMap.get(item.produto_id);
                return {
                    id: String(produto.produto_id),
                    width: produto.largura, height: produto.altura, length: produto.profundidade,
                    weight: produto.peso, insurance_value: 10,
                    quantity: item.quantidade
                };
            })
        };
        
        const headers = { 'Accept': 'application/json', 'Authorization': `Bearer ${process.env.MELHOR_ENVIO_TOKEN}`, 'Content-Type': 'application/json', 'User-Agent': 'Aplicação roberto.casali@nicocereais.com.br'};
        const meResponse = await axios.post('https://sandbox.melhorenvio.com.br/api/v2/me/shipment/calculate', requestBody, { headers });

        const cotacoesValidas = meResponse.data.filter((c: any) => !c.error);
        for (const cotacao of cotacoesValidas) {
            await client.query(
                `INSERT INTO cotacao_resultados (cotacao_id, transportadora, servico, preco, prazo_entrega, url_logo)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [novaCotacao.cotacao_id, cotacao.company.name, cotacao.name, cotacao.price, cotacao.delivery_time, cotacao.company.picture]
            );
        }

        await client.query("UPDATE cotacoes SET status = 'CONCLUIDO' WHERE cotacao_id = $1", [novaCotacao.cotacao_id]);
        await client.query('COMMIT');
        res.status(201).json(novaCotacao);

    } catch (error: any) {
        await client.query('ROLLBACK');
        console.error("Erro ao criar cotação:", error.response?.data || error);
        res.status(500).json({ message: "Erro ao criar cotação." });
    } finally {
        client.release();
    }
};