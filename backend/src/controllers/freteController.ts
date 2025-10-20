// backend/src/controllers/freteController.ts

import { Request, Response } from 'express';
import axios from 'axios';
import pool from '../config/db';

interface CotacaoItem {
  produto_id: number;
  quantidade: number;
}

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
    const { empresa_origem_id, cep_destino, itens, destinatario } = req.body as {
        empresa_origem_id: number;
        cep_destino: string;
        itens: CotacaoItem[];
        destinatario: string;
    };
    
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        for (const item of itens) {
            const stockRes = await client.query(
                `SELECT nome, (estoque_total - estoque_provisionado) AS disponivel FROM produtos WHERE produto_id = $1 FOR UPDATE`,
                [item.produto_id]
            );
            if (stockRes.rowCount === 0) throw new Error(`Produto com ID ${item.produto_id} não encontrado.`);
            const disponivel = stockRes.rows[0].disponivel;
            if (item.quantidade > disponivel) {
                throw new Error(`Estoque indisponível para ${stockRes.rows[0].nome}. Disponível: ${disponivel}, Solicitado: ${item.quantidade}`);
            }
        }

        const cotacaoRes = await client.query(
            'INSERT INTO cotacoes (empresa_origem_id, cep_destino, status, destinatario) VALUES ($1, $2, $3, $4) RETURNING *',
            [empresa_origem_id, cep_destino, 'PROCESSANDO', destinatario]
        );
        const novaCotacao = cotacaoRes.rows[0];

        const produtoIds = itens.map(item => item.produto_id);
        const produtosRes = await client.query('SELECT * FROM produtos WHERE produto_id = ANY($1::int[])', [produtoIds]);
        const empresaRes = await client.query('SELECT cep FROM empresas WHERE empresa_id = $1', [empresa_origem_id]);
        
        const produtosMap = new Map(produtosRes.rows.map((p: any) => [p.produto_id, p]));

        for (const item of itens) {
            await client.query(
                'INSERT INTO cotacao_itens (cotacao_id, produto_id, quantidade) VALUES ($1, $2, $3)',
                [novaCotacao.cotacao_id, item.produto_id, item.quantidade]
            );
            await client.query(
                `UPDATE produtos SET estoque_provisionado = estoque_provisionado + $1 WHERE produto_id = $2`,
                [item.quantidade, item.produto_id]
            );
        }

        const requestBody = {
            from: { postal_code: empresaRes.rows[0].cep.replace(/\D/g, '') },
            to: { postal_code: cep_destino.replace(/\D/g, '') },
            products: itens.map((item: CotacaoItem) => {
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
                `INSERT INTO cotacao_resultados (cotacao_id, service_id, transportadora, servico, preco, prazo_entrega, url_logo)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [novaCotacao.cotacao_id, cotacao.id, cotacao.company.name, cotacao.name, cotacao.price, cotacao.delivery_time, cotacao.company.picture]
            );
        }

        await client.query("UPDATE cotacoes SET status = 'CONCLUIDO' WHERE cotacao_id = $1", [novaCotacao.cotacao_id]);
        
        await client.query('COMMIT');
        res.status(201).json(novaCotacao);

    } catch (error: any) {
        await client.query('ROLLBACK');
        if (error instanceof Error) {
            console.error("Erro ao criar cotação:", error.message);
            return res.status(400).json({ message: error.message });
        }
        console.error("Erro ao criar cotação:", error.response?.data || error);
        res.status(500).json({ message: "Erro interno ao criar cotação." });
    } finally {
        client.release();
    }
};

export const generateLabel = async (req: Request, res: Response) => {
    const { cotacao_id, resultado_id, from, to } = req.body;

    const client = await pool.connect();
    try {
        const resultadoRes = await client.query('SELECT service_id FROM cotacao_resultados WHERE resultado_id = $1', [resultado_id]);
        const itensRes = await client.query('SELECT p.*, ci.quantidade FROM cotacao_itens ci JOIN produtos p ON ci.produto_id = p.produto_id WHERE ci.cotacao_id = $1', [cotacao_id]);
        
        if (resultadoRes.rowCount === 0) {
            return res.status(404).json({ message: 'Resultado da cotação não encontrado.' });
        }

        const serviceId = resultadoRes.rows[0].service_id;
        const itens = itensRes.rows;
        const totalValue = itens.reduce((acc, item) => acc + (50 * item.quantidade), 0); // Valor de seguro simbólico

        const cartPayload = {
            service: serviceId,
            from, to,
            products: itens.map(item => ({ name: item.nome, quantity: item.quantidade, unitary_value: 50 })),
            options: { insurance_value: totalValue, receipt: false, own_hand: false, reverse: false, non_commercial: true }
        };

        const headers = {
            'Accept': 'application/json',
            'Authorization': `Bearer ${process.env.MELHOR_ENVIO_TOKEN}`,
            'Content-Type': 'application/json',
            'User-Agent': `Aplicação ${process.env.ME_EMAIL || 'contato@empresa.com.br'}`
        };

        // PASSO 2: Adicionar ao carrinho
        const cartResponse = await axios.post('https://sandbox.melhorenvio.com.br/api/v2/me/cart', cartPayload, { headers });
        const orderId = cartResponse.data.id;
        if (!orderId) throw new Error('Falha ao adicionar item ao carrinho.');

        // PASSO 3: Checkout
        await axios.post('https://sandbox.melhorenvio.com.br/api/v2/me/shipment/checkout', { orders: [orderId] }, { headers });

        // PASSO 4: Gerar
        await axios.post('https://sandbox.melhorenvio.com.br/api/v2/me/shipment/generate', { orders: [orderId] }, { headers });
        await new Promise(resolve => setTimeout(resolve, 2000)); // Pausa

        // PASSO 5: Imprimir
        const printResponse = await axios.post('https://sandbox.melhorenvio.com.br/api/v2/me/shipment/print', { mode: 'private', orders: [orderId] }, { headers });
        const printUrl = printResponse.data.url;
        if (!printUrl) throw new Error('Falha ao obter URL de impressão.');

        res.json({ url: printUrl });

    } catch (error: any) {
        console.error("Erro ao gerar etiqueta:", error.response?.data || error.message);
        res.status(500).json({ message: error.response?.data?.error || "Erro interno ao gerar a etiqueta." });
    } finally {
        client.release();
    }
};