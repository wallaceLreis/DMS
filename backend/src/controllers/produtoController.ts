import { Request, Response } from 'express';
import pool from '../config/db';
import fs from 'fs';
import path from 'path';

// Busca um produto e suas unidades
export const getProdutoById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const produtoRes = await pool.query('SELECT * FROM produtos WHERE produto_id = $1', [id]);
        if (produtoRes.rowCount === 0) return res.status(404).json({ message: 'Produto não encontrado' });
        
        const unidadesRes = await pool.query('SELECT * FROM produto_unidades WHERE produto_id = $1', [id]);
        
        const produto = produtoRes.rows[0];
        produto.unidades = unidadesRes.rows;
        
        res.json(produto);
    } catch (error) {
        console.error("Erro ao buscar produto:", error);
        res.status(500).json({ message: "Erro ao buscar produto." });
    }
};

// Cria um produto e suas unidades em uma única transação
export const createProduto = async (req: Request, res: Response) => {
    const { nome, ean, altura, largura, profundidade, peso, unidades } = req.body;
    const imagem_url = req.file ? `/files/uploads/${req.file.filename}` : null;
    const client = await pool.connect();

    try {
        await client.query('BEGIN'); // Inicia a transação

        const lastCodeResult = await client.query('SELECT MAX(codigo) as max_code FROM produtos');
        const nextCode = lastCodeResult.rows[0].max_code ? Number(lastCodeResult.rows[0].max_code) + 1 : 101010001;

        const produtoQuery = `
            INSERT INTO produtos (codigo, nome, ean, imagem_url, altura, largura, profundidade, peso)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING produto_id`;
        const produtoResult = await client.query(produtoQuery, [nextCode, nome, ean, imagem_url, altura, largura, profundidade, peso]);
        const newProdutoId = produtoResult.rows[0].produto_id;

        // Insere a unidade base (que vem dos campos principais do produto)
        const unidadeBaseQuery = `
            INSERT INTO produto_unidades (produto_id, descricao, ean, fator_conversao, peso, altura, largura, profundidade)
            VALUES ($1, 'UNIDADE', $2, 1, $3, $4, $5, $6)`;
        await client.query(unidadeBaseQuery, [newProdutoId, ean, peso, altura, largura, profundidade]);

        // Insere as outras embalagens (unidades)
        if (unidades && unidades.length > 0) {
            for (const unidade of JSON.parse(unidades)) {
                const unidadeQuery = `
                    INSERT INTO produto_unidades (produto_id, descricao, ean, fator_conversao, peso, altura, largura, profundidade)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`;
                await client.query(unidadeQuery, [newProdutoId, unidade.descricao, unidade.ean, unidade.fator_conversao, unidade.peso, unidade.altura, unidade.largura, unidade.profundidade]);
            }
        }
        
        await client.query('COMMIT'); // Confirma a transação
        res.status(201).json({ produto_id: newProdutoId });
    } catch (error) {
        await client.query('ROLLBACK'); // Desfaz tudo em caso de erro
        console.error("Erro ao criar produto:", error);
        res.status(500).json({ message: "Erro ao criar produto." });
    } finally {
        client.release();
    }
};
export const getProdutos = async (req: Request, res: Response) => {
    const searchTerm = req.query.q ? `%${String(req.query.q)}%` : '%';
    try {
        const query = `
            SELECT * FROM produtos 
            WHERE nome ILIKE $1 OR codigo::text ILIKE $1 OR ean ILIKE $1
            ORDER BY nome
        `;
        const result = await pool.query(query, [searchTerm]);
        res.json(result.rows);
    } catch (error) {
        console.error("Erro ao buscar produtos:", error);
        res.status(500).json({ message: "Erro ao buscar produtos." });
    }
};

export const updateProduto = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { nome, ean, altura, largura, profundidade, peso } = req.body;
    const imagem_url = req.file ? `/files/uploads/${req.file.filename}` : null;

    try {
        if (imagem_url) {
            const oldProduto = await pool.query('SELECT imagem_url FROM produtos WHERE produto_id = $1', [id]);
            if (oldProduto.rows[0]?.imagem_url) {
                const oldImagePath = path.join(__dirname, '../../public', oldProduto.rows[0].imagem_url.replace('/files', ''));
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
        }
        
        const query = imagem_url
            ? `UPDATE produtos SET nome=$1, ean=$2, altura=$3, largura=$4, profundidade=$5, peso=$6, imagem_url=$7 WHERE produto_id=$8 RETURNING *`
            : `UPDATE produtos SET nome=$1, ean=$2, altura=$3, largura=$4, profundidade=$5, peso=$6 WHERE produto_id=$7 RETURNING *`;
        
        const params = imagem_url
            ? [nome, ean, altura, largura, profundidade, peso, imagem_url, id]
            : [nome, ean, altura, largura, profundidade, peso, id];

        const result = await pool.query(query, params);
        res.json(result.rows[0]);
    } catch (error) {
        console.error("Erro ao atualizar produto:", error);
        res.status(500).json({ message: "Erro ao atualizar produto." });
    }
};

export const deleteProduto = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const oldProduto = await pool.query('SELECT imagem_url FROM produtos WHERE produto_id = $1', [id]);
        
        const result = await pool.query('DELETE FROM produtos WHERE produto_id = $1', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Produto não encontrado." });
        }

        if (oldProduto.rows[0]?.imagem_url) {
            const oldImagePath = path.join(__dirname, '../../public', oldProduto.rows[0].imagem_url.replace('/files', ''));
             if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }
        
        res.status(204).send();
    } catch (error) {
        console.error("Erro ao deletar produto:", error);
        res.status(500).json({ message: "Erro ao deletar produto." });
    }
};