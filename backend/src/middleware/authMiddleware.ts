// backend/src/middleware/authMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import pool from '../config/db';

// Interface para estender o objeto Request do Express
interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    role: string;
  };
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 1. Extrai o token do cabeçalho
      token = req.headers.authorization.split(' ')[1];

      // 2. Verifica se o token é válido
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: number };

      // 3. Busca o usuário no banco de dados e anexa à requisição
      const result = await pool.query(
        'SELECT usuario_id, username, role FROM dms_usuarios WHERE usuario_id = $1',
        [decoded.id]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ message: 'Não autorizado, usuário não encontrado.' });
      }

      // Anexa o objeto do usuário (sem o hash da senha) à requisição
      const user = result.rows[0];
      req.user = {
        id: user.usuario_id,
        username: user.username,
        role: user.role,
      };

      // 4. Passa para o próximo middleware (ou para o controller da rota)
      next();

    } catch (error) {
      console.error('Erro na autenticação do token:', error);
      return res.status(401).json({ message: 'Não autorizado, token inválido.' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Não autorizado, token não fornecido.' });
  }
};