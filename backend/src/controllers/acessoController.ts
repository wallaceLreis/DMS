import { Request, Response } from 'express';
import pool from '../config/db';

export const getAcessosPorTela = async (req: Request, res: Response) => {
    const { tela_id } = req.query;
    if (!tela_id) {
        return res.status(400).json({ message: "O parâmetro 'tela_id' é obrigatório." });
    }
    try {
        const result = await pool.query(
            `SELECT a.acesso_id, a.usuario_id, a.pode_incluir, a.pode_alterar, a.pode_excluir, u.username 
             FROM dms_acessos a 
             JOIN dms_usuarios u ON u.usuario_id = a.usuario_id
             WHERE a.tela_id = $1 ORDER BY u.username`,
            [tela_id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error("Erro ao buscar acessos:", error);
        res.status(500).json({ message: "Erro ao buscar acessos." });
    }
};

export const createAcesso = async (req: Request, res: Response) => {
    const { usuario_id, tela_id, pode_incluir, pode_alterar, pode_excluir } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO dms_acessos (usuario_id, tela_id, pode_incluir, pode_alterar, pode_excluir) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [usuario_id, tela_id, pode_incluir || false, pode_alterar || false, pode_excluir || false]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Erro ao criar acesso:", error);
        res.status(500).json({ message: "Erro ao criar acesso." });
    }
};

export const updateAcesso = async (req: Request, res: Response) => {
    const { acesso_id } = req.params;
    const { pode_incluir, pode_alterar, pode_excluir } = req.body;

    try {
        const result = await pool.query(
            `UPDATE dms_acessos 
             SET pode_incluir = $1, pode_alterar = $2, pode_excluir = $3 
             WHERE acesso_id = $4 
             RETURNING *`,
            [pode_incluir, pode_alterar, pode_excluir, acesso_id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Registro de acesso não encontrado." });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error("Erro ao atualizar acesso:", error);
        res.status(500).json({ message: "Erro ao atualizar acesso." });
    }
};

export const deleteAcesso = async (req: Request, res: Response) => {
    const { acesso_id } = req.params;
    try {
        const result = await pool.query('DELETE FROM dms_acessos WHERE acesso_id = $1', [acesso_id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Registro de acesso não encontrado." });
        }
        res.status(204).send();
    } catch (error) {
        console.error("Erro ao excluir acesso:", error);
        res.status(500).json({ message: "Erro ao excluir acesso." });
    }
};