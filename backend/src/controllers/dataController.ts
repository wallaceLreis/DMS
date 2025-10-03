// backend/src/controllers/dataController.ts
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

    if (!/^[a-zA-Z0-9_]+$/.test(tableName) || !(await isTableAllowed(tableName))) {
        return res.status(403).json({ message: 'Acesso negado a esta tabela.' });
    }

    try {
        const query = `SELECT * FROM ${tableName}`;
        const result = await pool.query(query);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: `Erro ao buscar dados da tabela ${tableName}.` });
    }
};

// NOVA FUNÇÃO
export const deleteGenericData = async (req: Request, res: Response) => {
    const { tableName, id } = req.params;

    // A validação de permissão já foi feita pelo middleware 'protect'
    if (!/^[a-zA-Z0-9_]+$/.test(tableName)) {
        return res.status(400).json({ message: 'Nome de tabela inválido.' });
    }

    try {
        // Assume que a chave primária da tabela se chama 'id'
        // Em um sistema mais complexo, o nome da chave primária viria dos metadados
        const query = `DELETE FROM ${tableName} WHERE id = $1`;
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