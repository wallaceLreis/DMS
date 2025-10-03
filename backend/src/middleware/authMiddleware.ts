// src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Estendemos a interface Request do Express para poder adicionar a propriedade 'user'
interface AuthRequest extends Request {
  user?: { id: number; username: string; role: string };
}

export const protect = (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;

  // O token geralmente é enviado no header 'Authorization' no formato 'Bearer <token>'
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 1. Extrai o token
      token = req.headers.authorization.split(' ')[1];

      // 2. Verifica se o token é válido
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: number; username: string; role: string };

      // 3. Adiciona os dados do usuário ao objeto 'req' para uso futuro
      req.user = decoded;

      next(); // Tudo certo, pode seguir para a rota final
    } catch (error) {
      console.error('Token inválido:', error);
      return res.status(401).json({ message: 'Não autorizado, token inválido.' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Não autorizado, token não fornecido.' });
  }
};