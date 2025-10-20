// backend/src/controllers/estoqueController.ts

import { Request, Response } from 'express';
import pool from '../config/db';

// Interface para requisições autenticadas
interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    role: string;
  };
}

// ATUALIZADO: Lê estoque da tabela 'produtos'
export const getEstoqueAtual = async (req: Request, res: Response) => {
    const { produto_id } = req.query;

    try {
        let query = `
            SELECT 
                produto_id,
                codigo,
                nome,
                estoque_total,
                estoque_provisionado,
                (estoque_total - estoque_provisionado) AS estoque_disponivel
            FROM produtos
        `;
        
        const params: any[] = [];

        if (produto_id) {
            query += ` WHERE produto_id = $1`;
            params.push(produto_id as string);
        }

        query += ` ORDER BY nome`;

        const result = await pool.query(query, params);

        if (produto_id) {
            // Retorna o objeto único para o diálogo de cotação
            if (result.rows.length > 0) {
                res.json(result.rows[0]); 
            } else {
                res.status(404).json({ message: "Produto não encontrado." });
            }
        } else {
            // Retorna a lista completa para a tela de estoque
            res.json(result.rows);
        }

    } catch (error) {
        console.error("Erro ao buscar estoque atual:", error);
        res.status(500).json({ message: "Erro interno do servidor." });
    }
};

// CORRIGIDO: Usa 'AuthRequest' e 'req.user.id' e vira uma transação
export const createMovimento = async (req: AuthRequest, res: Response) => {
    const { produto_id, tipo_movimento, quantidade, observacao, numero_nota } = req.body;
    
    // CORREÇÃO DO BUG: Pega o ID do usuário logado (req.user)
    const usuario_id = req.user?.id;

    if (!produto_id || !usuario_id || !tipo_movimento || !quantidade) {
        return res.status(400).json({ message: "Campos obrigatórios faltando." });
    }

    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');

        // 1. Insere o log do movimento
        const result = await client.query(
            `INSERT INTO estoque_movimentos (produto_id, usuario_id, tipo_movimento, quantidade, observacao, numero_nota)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [produto_id, usuario_id, tipo_movimento, Number(quantidade), observacao, numero_nota]
        );

        // 2. Calcula a quantidade a ser alterada
        const qtdAlterar = (tipo_movimento === 'ENTRADA') ? Number(quantidade) : -Number(quantidade);

        // 3. Atualiza o estoque total (físico) na tabela de produtos
        await client.query(
            `UPDATE produtos
             SET estoque_total = estoque_total + $1
             WHERE produto_id = $2`,
            [qtdAlterar, produto_id]
        );

        await client.query('COMMIT');
        res.status(201).json(result.rows[0]);

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Erro ao criar movimento de estoque:", error);
        res.status(500).json({ message: "Erro interno do servidor." });
    } finally {
        client.release();
    }
};

// Sem alterações, apenas lista o histórico
export const getMovimentosPorProduto = async (req: Request, res: Response) => {
    const { produto_id } = req.params;
    
    try {
        const query = `
            SELECT m.*, u.username
            FROM estoque_movimentos m
            JOIN dms_usuarios u ON m.usuario_id = u.usuario_id
            WHERE m.produto_id = $1
            ORDER BY m.data_movimento DESC
        `;
        const result = await pool.query(query, [produto_id]);
        res.json(result.rows);
    } catch (error) {
        console.error("Erro ao buscar movimentos:", error);
        res.status(500).json({ message: "Erro interno do servidor." });
    }
};