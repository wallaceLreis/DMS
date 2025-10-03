// src/controllers/telaController.ts
import { Request, Response } from 'express';
import * as telaService from '../services/telaService';

export const getTelas = async (req: Request, res: Response) => {
  try {
    const telas = await telaService.findAllTelas();
    res.status(200).json(telas);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar telas.' });
  }
};

export const getTelaById = async (req: Request, res: Response) => {
  try {
    const telaId = parseInt(req.params.id, 10);
    const tela = await telaService.findTelaById(telaId);

    if (!tela) {
      return res.status(404).json({ message: 'Tela não encontrada.' });
    }

    res.status(200).json(tela);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar detalhes da tela.' });
  }
};