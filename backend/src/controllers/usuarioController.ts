import { Request, Response } from 'express';
import pool from '../config/db';
import bcrypt from 'bcrypt';

export const getUsuarios = async (req: Request, res: Response) => {
    const result = await pool.query('SELECT usuario_id, username, role, ativo FROM dms_usuarios ORDER BY username');
    res.json(result.rows);
};

export const createUsuario = async (req: Request, res: Response) => {
    const { username, password, role } = req.body;
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const result = await pool.query(
        'INSERT INTO dms_usuarios (username, password_hash, role) VALUES ($1, $2, $3) RETURNING usuario_id, username, role, ativo',
        [username, password_hash, role]
    );
    res.status(201).json(result.rows[0]);
};
// Funções de update e delete seriam adicionadas aqui