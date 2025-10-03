import { Request, Response } from 'express';
import * as userService from '../services/userService';
import bcrypt from 'bcryptjs'; // Garantido que está usando bcryptjs
import jwt from 'jsonwebtoken';

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Usuário e senha são obrigatórios.' });
  }
  try {
    const user = await userService.findByUsername(username);
    if (!user || !user.ativo) {
      return res.status(401).json({ message: 'Usuário não encontrado ou inativo.' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Senha inválida.' });
    }
    const token = jwt.sign(
      { id: user.usuario_id, username: user.username, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '8h' }
    );
    return res.status(200).json({
      message: 'Login bem-sucedido!',
      token: token
    });
  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};