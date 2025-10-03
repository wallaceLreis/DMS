import { Request, Response } from 'express';
import pool from '../config/db';
import fs from 'fs';
import path from 'path';

export const getProdutos = async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM produtos ORDER BY nome');
        res.json(result.rows);
    } catch (error) {
        console.error("Erro ao buscar produtos:", error);
        res.status(500).json({ message: "Erro ao buscar produtos." });
    }
};

export const createProduto = async (req: Request, res: Response) => {
    const { nome, ean, altura, largura, profundidade, peso } = req.body;
    const imagem_url = req.file ? `/files/uploads/${req.file.filename}` : null;

    try {
        const lastCodeResult = await pool.query('SELECT MAX(codigo) as max_code FROM produtos');
        const nextCode = lastCodeResult.rows[0].max_code ? Number(lastCodeResult.rows[0].max_code) + 1 : 101010001;

        const newProduto = await pool.query(
            `INSERT INTO produtos (codigo, nome, ean, imagem_url, altura, largura, profundidade, peso)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [nextCode, nome, ean, imagem_url, altura, largura, profundidade, peso]
        );
        res.status(201).json(newProduto.rows[0]);
    } catch (error) {
        console.error("Erro ao criar produto:", error);
        res.status(500).json({ message: "Erro ao criar produto." });
    }
};

export const updateProduto = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { nome, ean, altura, largura, profundidade, peso } = req.body;
    const imagem_url = req.file ? `/files/uploads/${req.file.filename}` : null;

    try {
        // Se uma nova imagem foi enviada, precisamos deletar a antiga
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
        // Pega a URL da imagem antes de deletar o registro
        const oldProduto = await pool.query('SELECT imagem_url FROM produtos WHERE produto_id = $1', [id]);
        
        const result = await pool.query('DELETE FROM produtos WHERE produto_id = $1', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Produto não encontrado." });
        }

        // Se o registro foi deletado e havia uma imagem, remove o arquivo
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