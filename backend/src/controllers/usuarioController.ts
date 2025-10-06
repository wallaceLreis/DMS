import { Request, Response } from 'express';
import pool from '../config/db';
import bcrypt from 'bcryptjs';

interface AuthRequest extends Request {
  user?: { id: number; username: string; role: string };
}

export const getUsuarios = async (req: Request, res: Response) => {
    const searchTerm = req.query.q ? `%${String(req.query.q)}%` : '%';
    const query = `
        SELECT usuario_id, username, role, ativo, is_nativo 
        FROM dms_usuarios 
        WHERE username ILIKE $1 
        ORDER BY username
    `;
    try {
        const result = await pool.query(query, [searchTerm]);
        res.json(result.rows);
    } catch (error) {
        console.error("Erro ao buscar usuários:", error);
        res.status(500).json({ message: "Erro ao buscar usuários." });
    }
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

export const changePassword = async (req: AuthRequest, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    const usuario_id = req.user?.id;
    if (!usuario_id) {
        return res.status(401).json({ message: 'Não autorizado.' });
    }
    try {
        const userResult = await pool.query('SELECT password_hash FROM dms_usuarios WHERE usuario_id = $1', [usuario_id]);
        if (userResult.rowCount === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }
        const storedHash = userResult.rows[0].password_hash;
        const isMatch = await bcrypt.compare(currentPassword, storedHash);
        if (!isMatch) {
            return res.status(400).json({ message: 'A senha atual está incorreta.' });
        }
        const salt = await bcrypt.genSalt(10);
        const newPasswordHash = await bcrypt.hash(newPassword, salt);
        await pool.query('UPDATE dms_usuarios SET password_hash = $1 WHERE usuario_id = $2', [newPasswordHash, usuario_id]);
        res.status(200).json({ message: 'Senha alterada com sucesso.' });
    } catch (error) {
        console.error("Erro ao alterar senha:", error);
        res.status(500).json({ message: 'Erro interno ao alterar a senha.' });
    }
};

export const getMenuForCurrentUser = async (req: AuthRequest, res: Response) => {
    const { id, role } = req.user!;
    try {
        let menuResult;
        if (role === 'sup') {
            menuResult = await pool.query(
                `SELECT tela_id, titulo_tela, nome_tabela FROM meta_telas WHERE ativo = TRUE ORDER BY titulo_tela`
            );
        } else {
            menuResult = await pool.query(
                `SELECT t.tela_id, t.titulo_tela, t.nome_tabela 
                 FROM meta_telas t
                 JOIN dms_acessos a ON t.tela_id = a.tela_id
                 WHERE a.usuario_id = $1 AND t.ativo = TRUE 
                 ORDER BY t.titulo_tela`,
                [id]
            );
        }
        res.json(menuResult.rows);
    } catch (error) {
        console.error("Erro ao buscar menu do usuário:", error);
        res.status(500).json({ message: 'Erro ao buscar menu.' });
    }
};