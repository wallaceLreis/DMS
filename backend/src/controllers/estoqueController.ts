import { Request, Response } from 'express';
import pool from '../config/db';

interface AuthRequest extends Request {
  user?: { id: number; };
}

// Retorna a lista de produtos com estoque, agora com busca
export const getEstoqueAtual = async (req: Request, res: Response) => {
    const searchTerm = req.query.q ? `%${String(req.query.q)}%` : '%';

    try {
        const query = `
            SELECT
                p.produto_id, p.codigo, p.nome, p.ean,
                COALESCE(SUM(CASE WHEN m.tipo_movimento = 'ENTRADA' THEN m.quantidade ELSE -m.quantidade END), 0) as quantidade_atual
            FROM produtos p
            LEFT JOIN estoque_movimentos m ON p.produto_id = m.produto_id
            WHERE p.nome ILIKE $1 OR p.codigo::text ILIKE $1
            GROUP BY p.produto_id
            ORDER BY p.nome;
        `;
        const result = await pool.query(query, [searchTerm]);
        res.json(result.rows);
    } catch (error) {
        console.error("Erro ao buscar estoque:", error);
        res.status(500).json({ message: "Erro ao buscar estoque." });
    }
};

// Cria um novo movimento, agora aceitando o numero_nota
export const createMovimento = async (req: AuthRequest, res: Response) => {
    const { produto_id, tipo_movimento, quantidade, observacao, numero_nota } = req.body;
    const usuario_id = req.user?.id;

    if (!['ENTRADA', 'SAIDA'].includes(tipo_movimento)) {
        return res.status(400).json({ message: "Tipo de movimento inválido." });
    }

    try {
        const newMovimento = await pool.query(
            `INSERT INTO estoque_movimentos (produto_id, usuario_id, tipo_movimento, quantidade, observacao, numero_nota)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [produto_id, usuario_id, tipo_movimento, quantidade, observacao, numero_nota]
        );
        res.status(201).json(newMovimento.rows[0]);
    } catch (error) {
        console.error("Erro ao criar movimento:", error);
        res.status(500).json({ message: "Erro ao criar movimento." });
    }
};

// NOVA FUNÇÃO: Busca o histórico de um produto específico
export const getMovimentosPorProduto = async (req: Request, res: Response) => {
    const { produto_id } = req.params;
    try {
        // Query 1: Detalhes do produto e estoque calculado
        const produtoQuery = `
            SELECT
                p.codigo, p.nome,
                COALESCE(SUM(CASE WHEN m.tipo_movimento = 'ENTRADA' THEN m.quantidade ELSE -m.quantidade END), 0) as quantidade_atual,
                MAX(m.data_movimento) as ultimo_lancamento
            FROM produtos p
            LEFT JOIN estoque_movimentos m ON p.produto_id = m.produto_id
            WHERE p.produto_id = $1
            GROUP BY p.produto_id;
        `;
        const produtoResult = await pool.query(produtoQuery, [produto_id]);

        if (produtoResult.rowCount === 0) {
            return res.status(404).json({ message: "Produto não encontrado." });
        }

        // Query 2: Histórico de ENTRADAS para o produto
        const historicoQuery = `
            SELECT movimento_id, numero_nota, quantidade, data_movimento 
            FROM estoque_movimentos 
            WHERE produto_id = $1 AND tipo_movimento = 'ENTRADA' 
            ORDER BY data_movimento DESC;
        `;
        const historicoResult = await pool.query(historicoQuery, [produto_id]);

        // Combina os resultados em um único objeto
        const responseData = {
            ...produtoResult.rows[0],
            historico: historicoResult.rows
        };
        
        res.json(responseData);
    } catch (error) {
        console.error("Erro ao buscar histórico do produto:", error);
        res.status(500).json({ message: "Erro ao buscar histórico do produto." });
    }
};