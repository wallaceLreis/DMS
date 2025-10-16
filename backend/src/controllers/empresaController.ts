// backend/src/controllers/empresaController.ts

import { Request, Response } from 'express';
import pool from '../config/db';

// Função ÚNICA para buscar empresas. Pode ser usada tanto na tela de gestão quanto em lookups.
export const getEmpresas = async (req: Request, res: Response) => {
    // A lógica de busca por termo (q) é mantida, o que é ótimo para Autocompletes.
    const searchTerm = req.query.q ? `%${String(req.query.q)}%` : '%';
    const query = `
        SELECT * FROM empresas
        WHERE nome_fantasia ILIKE $1 OR razao_social ILIKE $1 OR cnpj ILIKE $1
        ORDER BY nome_fantasia
    `; // REMOVIDO: "AND ativo = true" do final da cláusula WHERE

    try {
        const result = await pool.query(query, [searchTerm]);
        res.json(result.rows);
    } catch (error) {
        console.error("Erro ao buscar empresas:", error);
        res.status(500).json({ message: "Erro ao buscar empresas." });
    }
};

export const createEmpresa = async (req: Request, res: Response) => {
    const { nome_fantasia, razao_social, cnpj, email, cep, logradouro, numero, complemento, bairro, cidade, uf } = req.body;
    try {
        const newEmpresa = await pool.query(
            `INSERT INTO empresas (nome_fantasia, razao_social, cnpj, email, cep, logradouro, numero, complemento, bairro, cidade, uf)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
            [nome_fantasia, razao_social, cnpj, email, cep, logradouro, numero, complemento, bairro, cidade, uf]
        );
        res.status(201).json(newEmpresa.rows[0]);
    } catch (error) {
        console.error("Erro ao criar empresa:", error);
        res.status(500).json({ message: "Erro ao criar empresa." });
    }
};

export const updateEmpresa = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { nome_fantasia, razao_social, cnpj, email, cep, logradouro, numero, complemento, bairro, cidade, uf } = req.body;
    try {
        const result = await pool.query(
            `UPDATE empresas SET nome_fantasia=$1, razao_social=$2, cnpj=$3, email=$4, cep=$5, logradouro=$6, numero=$7, complemento=$8, bairro=$9, cidade=$10, uf=$11
             WHERE empresa_id=$12 RETURNING *`,
            [nome_fantasia, razao_social, cnpj, email, cep, logradouro, numero, complemento, bairro, cidade, uf, id]
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