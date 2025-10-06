import { Request, Response } from 'express';
import pool from '../config/db';

const isTableAllowed = async (tableName: string): Promise<boolean> => {
    const result = await pool.query(
        "SELECT 1 FROM meta_telas WHERE nome_tabela = $1 AND ativo = TRUE",
        [tableName]
    );
    return (result.rowCount ?? 0) > 0;
};

export const getGenericData = async (req: Request, res: Response) => {
    const { tableName } = req.params;
    const searchTerm = req.query.q ? `%${String(req.query.q)}%` : '%';

    if (!/^[a-zA-Z0-9_]+$/.test(tableName) || !(await isTableAllowed(tableName))) {
        return res.status(403).json({ message: 'Acesso negado a esta tabela.' });
    }

    try {
        // Constrói a query dinamicamente para incluir a busca
        // A cláusula table_name::text ILIKE $1 é um truque do PostgreSQL para buscar em todas as colunas
        const query = `SELECT * FROM ${tableName} WHERE ${tableName}::text ILIKE $1`;
        const result = await pool.query(query, [searchTerm]);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: `Erro ao buscar dados da tabela ${tableName}.` });
    }
};

export const deleteGenericData = async (req: Request, res: Response) => {
    const { tableName, id } = req.params;

    if (!/^[a-zA-Z0-9_]+$/.test(tableName)) {
        return res.status(400).json({ message: 'Nome de tabela inválido.' });
    }

    try {
        const query = `DELETE FROM ${tableName} WHERE id = $1`; // Assume que a chave primária é 'id'
        const result = await pool.query(query, [id]);
        
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Registro não encontrado.' });
        }
        
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: `Erro ao deletar registro da tabela ${tableName}.` });
    }
};