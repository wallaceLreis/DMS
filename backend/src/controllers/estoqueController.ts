import { Request, Response } from 'express';
import pool from '../config/db';

interface AuthRequest extends Request {
  user?: { id: number; };
}

// Retorna a lista de todos os produtos com seu estoque atual calculado
export const getEstoqueAtual = async (req: Request, res: Response) => {
    try {
        const query = `
            SELECT
                p.produto_id,
                p.codigo,
                p.nome,
                p.ean,
                COALESCE(SUM(CASE WHEN m.tipo_movimento = 'ENTRADA' THEN m.quantidade ELSE -m.quantidade END), 0) as quantidade_atual
            FROM
                produtos p
            LEFT JOIN
                estoque_movimentos m ON p.produto_id = m.produto_id
            GROUP BY
                p.produto_id
            ORDER BY
                p.nome;
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error("Erro ao buscar estoque:", error);
        res.status(500).json({ message: "Erro ao buscar estoque." });
    }
};

// Cria um novo movimento de entrada ou saída
export const createMovimento = async (req: AuthRequest, res: Response) => {
    const { produto_id, tipo_movimento, quantidade, observacao } = req.body;
    const usuario_id = req.user?.id;

    if (!['ENTRADA', 'SAIDA'].includes(tipo_movimento)) {
        return res.status(400).json({ message: "Tipo de movimento inválido. Use 'ENTRADA' ou 'SAIDA'." });
    }

    try {
        const newMovimento = await pool.query(
            `INSERT INTO estoque_movimentos (produto_id, usuario_id, tipo_movimento, quantidade, observacao)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [produto_id, usuario_id, tipo_movimento, quantidade, observacao]
        );
        res.status(201).json(newMovimento.rows[0]);
    } catch (error) {
        console.error("Erro ao criar movimento de estoque:", error);
        res.status(500).json({ message: "Erro ao criar movimento de estoque." });
    }
};