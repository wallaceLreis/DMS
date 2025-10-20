// backend/src/controllers/empresaController.ts

import { Request, Response } from 'express';
import pool from '../config/db';

// Busca todas as empresas (para a listagem)
export const getEmpresas = async (req: Request, res: Response) => {
    const searchTerm = req.query.q ? `%${String(req.query.q)}%` : '%';
    const query = `
        SELECT * FROM empresas
        WHERE nome_fantasia ILIKE $1 OR razao_social ILIKE $1 OR cnpj ILIKE $1
        ORDER BY nome_fantasia
    `;
    try {
        const result = await pool.query(query, [searchTerm]);
        res.json(result.rows);
    } catch (error) {
        console.error("Erro ao buscar empresas:", error);
        res.status(500).json({ message: "Erro ao buscar empresas." });
    }
};

// <<< NOVA FUNÇÃO PARA CORRIGIR O BUG >>>
// Busca uma única empresa pelo ID
export const getEmpresaById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM empresas WHERE empresa_id = $1', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Empresa não encontrada.' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error("Erro ao buscar empresa por ID:", error);
        res.status(500).json({ message: "Erro ao buscar empresa." });
    }
};

// ATUALIZADO: Inclui o campo 'telefone'
export const createEmpresa = async (req: Request, res: Response) => {
    const { nome_fantasia, razao_social, cnpj, email, telefone, cep, logouro, numero, complemento, bairro, cidade, uf, ativo } = req.body;
    try {
        const newEmpresa = await pool.query(
            `INSERT INTO empresas (nome_fantasia, razao_social, cnpj, email, telefone, cep, logouro, numero, complemento, bairro, cidade, uf, ativo)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
            [nome_fantasia, razao_social, cnpj, email, telefone, cep, logouro, numero, complemento, bairro, cidade, uf, ativo ?? true]
        );
        res.status(201).json(newEmpresa.rows[0]);
    } catch (error) {
        console.error("Erro ao criar empresa:", error);
        res.status(500).json({ message: "Erro ao criar empresa." });
    }
};

// ATUALIZADO: Inclui o campo 'telefone'
export const updateEmpresa = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { nome_fantasia, razao_social, cnpj, email, telefone, cep, logouro, numero, complemento, bairro, cidade, uf, ativo } = req.body;
    try {
        const result = await pool.query(
            `UPDATE empresas SET 
             nome_fantasia=$1, razao_social=$2, cnpj=$3, email=$4, telefone=$5, cep=$6, logouro=$7, 
             numero=$8, complemento=$9, bairro=$10, cidade=$11, uf=$12, ativo=$13
             WHERE empresa_id=$14 RETURNING *`,
            [nome_fantasia, razao_social, cnpj, email, telefone, cep, logouro, numero, complemento, bairro, cidade, uf, ativo, id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error("Erro ao atualizar empresa:", error);
        res.status(500).json({ message: "Erro ao atualizar empresa." });
    }
};

export const deleteEmpresa = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM empresas WHERE empresa_id = $1', [id]);
        res.status(204).send();
    } catch (error) {
        console.error("Erro ao deletar empresa:", error);
        res.status(500).json({ message: "Erro ao deletar empresa." });
    }
};