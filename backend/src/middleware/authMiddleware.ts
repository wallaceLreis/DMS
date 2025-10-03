// backend/src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import pool from '../config/db';

interface AuthRequest extends Request {
  user?: { id: number; username: string; role: string };
}

// Função auxiliar para extrair o nome da tela da URL
const getScreenNameFromUrl = (url: string): string | null => {
    const parts = url.split('/');
    // Ex: /api/data/clientes -> clientes
    if (parts[2] === 'data' && parts[3]) {
        // Remove query params, se houver
        return parts[3].split('?')[0];
    }
    // Ex: /api/telas -> telas
    if(parts[2]){
        return parts[2].split('?')[0];
    }
    return null;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: number; username: string; role: string };
      req.user = decoded;

      // Se o usuário for 'sup', ele tem acesso total a tudo.
      if (req.user.role === 'sup') {
          return next();
      }

      const screenName = getScreenNameFromUrl(req.originalUrl);

      // Permite acesso às telas base do sistema
      if (!screenName || ['usuarios', 'acessos', 'telas'].includes(screenName)) {
          return next();
      }

      // Busca a permissão do usuário para a tela específica
      const permCheck = await pool.query(
          `SELECT a.* FROM dms_acessos a
           JOIN meta_telas t ON a.tela_id = t.tela_id
           WHERE a.usuario_id = $1 AND t.nome_tabela = $2`,
          [req.user.id, screenName]
      );

      // Se não encontrou nenhuma linha de permissão, bloqueia o acesso
      if (permCheck.rowCount === 0) {
          return res.status(403).json({ message: 'Acesso negado.' });
      }

      const permissoes = permCheck.rows[0];

      // VERIFICA PERMISSÕES ESPECÍFICAS POR MÉTODO HTTP
      if (req.method === 'DELETE' && !permissoes.pode_excluir) {
           return res.status(403).json({ message: 'Permissão para excluir negada.' });
      }
      if (req.method === 'PUT' && !permissoes.pode_alterar) {
           return res.status(403).json({ message: 'Permissão para alterar negada.' });
      }
      if (req.method === 'POST' && !permissoes.pode_incluir) {
           return res.status(403).json({ message: 'Permissão para incluir negada.' });
      }
      
      next(); // Se passou por todas as verificações, permite o acesso.
    } catch (error) {
      return res.status(401).json({ message: 'Não autorizado, token inválido.' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Não autorizado, token não fornecido.' });
  }
};