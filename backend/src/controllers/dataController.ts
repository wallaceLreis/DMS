// backend/src/controllers/dataController.ts
import { Request, Response } from 'express';
import pool from '../config/db';

// Função para validar se a tabela é permitida
const isTableAllowed = async (tableName: string): Promise<boolean> => {
    const result = await pool.query(
        "SELECT 1 FROM meta_telas WHERE nome_tabela = $1 AND ativo = TRUE",
        [tableName]
    );
    // Se result.rowCount for null, trata como 0
    return (result.rowCount ?? 0) > 0;
};


export const getGenericData = async (req: Request, res: Response) => {
    const { tableName } = req.params;

    // Validação de segurança: verifica se a tabela está no dicionário e ativa
    if (!/^[a-zA-Z0-9_]+$/.test(tableName) || !(await isTableAllowed(tableName))) {
        return res.status(403).json({ message: 'Acesso negado a esta tabela.' });
    }

    try {
        // Usamos $1 para evitar SQL Injection, mas o nome da tabela não pode ser um parâmetro.
        // A validação acima garante que o tableName é seguro.
        const query = `SELECT * FROM ${tableName}`;
        const result = await pool.query(query);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: `Erro ao buscar dados da tabela ${tableName}.` });
    }
};