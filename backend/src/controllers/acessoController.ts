import { Request, Response } from 'express';
import pool from '../config/db';

export const getAcessosPorTela = async (req: Request, res: Response) => {
    const { tela_id } = req.query;
    const result = await pool.query(
        `SELECT a.*, u.username 
         FROM dms_acessos a 
         JOIN dms_usuarios u ON u.usuario_id = a.usuario_id
         WHERE a.tela_id = $1`,
        [tela_id]
    );
    res.json(result.rows);
};

export const createAcesso = async (req: Request, res: Response) => {
    const { usuario_id, tela_id, pode_incluir, pode_alterar, pode_excluir } = req.body;
    const result = await pool.query(
        'INSERT INTO dms_acessos (usuario_id, tela_id, pode_incluir, pode_alterar, pode_excluir) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [usuario_id, tela_id, pode_incluir, pode_alterar, pode_excluir]
    );
    res.status(201).json(result.rows[0]);
};
// Funções de update e delete seriam adicionadas aqui