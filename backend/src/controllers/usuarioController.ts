// backend/src/controllers/usuarioController.ts
import { Request, Response } from 'express';
import pool from '../config/db';
import bcrypt from 'bcrypt';

export const getUsuarios = async (req: Request, res: Response) => {
    const result = await pool.query('SELECT usuario_id, username, role, ativo, is_nativo FROM dms_usuarios ORDER BY username');
    res.json(result.rows);
};

export const createUsuario = async (req: Request, res: Response) => {
    const { username, password, role } = req.body;
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const result = await pool.query(
        'INSERT INTO dms_usuarios (username, password_hash, role) VALUES ($1, $2, $3) RETURNING usuario_id, username, role, ativo, is_nativo',
        [username, password_hash, role || 'user']
    );
    res.status(201).json(result.rows[0]);
};

export const deleteUsuario = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const check = await pool.query('SELECT is_nativo FROM dms_usuarios WHERE usuario_id = $1', [id]);
        if (check.rows[0]?.is_nativo) {
            return res.status(403).json({ message: 'Usuários nativos não podem ser excluídos.' });
        }
        await pool.query('DELETE FROM dms_usuarios WHERE usuario_id = $1', [id]);
        res.status(204).send();
    } catch (error) {
        console.error("Erro ao deletar usuário:", error);
        res.status(500).json({ message: 'Erro ao deletar usuário.' });
    }
};