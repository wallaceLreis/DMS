import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import pool from '../config/db';

interface AuthRequest extends Request {
  user?: { id: number; username: string; role: string };
}

const getScreenNameFromUrl = (url: string): string | null => {
    const parts = url.split('/');
    if (parts[2] === 'data' && parts[3]) {
        return parts[3].split('?')[0];
    }
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

      // Regra 1: Se o usuário for 'sup', ele tem acesso total e imediato.
      if (req.user.role === 'sup') {
          return next();
      }

      const screenName = getScreenNameFromUrl(req.originalUrl);

      // --- LÓGICA CORRIGIDA ---
      const isBaseScreen = screenName && ['usuarios', 'acessos', 'telas'].includes(screenName);
      
      if (isBaseScreen) {
          // Regra 2: Se for uma tela base, permite apenas a LEITURA (GET) para usuários comuns.
          if (req.method === 'GET') {
              return next();
          } else {
              // Bloqueia POST, PUT, DELETE etc. para usuários comuns em telas base.
              return res.status(403).json({ message: 'Acesso negado. Apenas superusuários podem modificar recursos do sistema.' });
          }
      }
      // --- FIM DA LÓGICA CORRIGIDA ---

      // Se não for uma tela base (ex: 'clientes'), verifica a tabela dms_acessos.
      if (screenName) {
        const permCheck = await pool.query(
            `SELECT a.* FROM dms_acessos a
             JOIN meta_telas t ON a.tela_id = t.tela_id
             WHERE a.usuario_id = $1 AND t.nome_tabela = $2`,
            [req.user.id, screenName]
        );

        if (permCheck.rowCount === 0) {
            return res.status(403).json({ message: 'Acesso negado.' });
        }

        const permissoes = permCheck.rows[0];

        if (req.method === 'DELETE' && !permissoes.pode_excluir) {
             return res.status(403).json({ message: 'Permissão para excluir negada.' });
        }
        if (req.method === 'PUT' && !permissoes.pode_alterar) {
             return res.status(403).json({ message: 'Permissão para alterar negada.' });
        }
        if (req.method === 'POST' && !permissoes.pode_incluir) {
             return res.status(403).json({ message: 'Permissão para incluir negada.' });
        }
      }
      
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Não autorizado, token inválido.' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Não autorizado, token não fornecido.' });
  }
};