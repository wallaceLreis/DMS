// src/controllers/campoController.ts
import { Request, Response } from 'express';
import * as campoService from '../services/campoService';

export const createCampo = async (req: Request, res: Response) => {
  try {
    const telaId = parseInt(req.params.telaId, 10);

    // Validação da regra de negócio
    if (req.body.formato_campo === 'checkbox' && req.body.tipo_dado !== 'BOOLEAN') {
        return res.status(400).json({ message: 'Campos com exibição checkbox devem ser do tipo BOOLEAN.' });
    }

    const novoCampo = await campoService.createCampo(telaId, req.body);
    res.status(201).json(novoCampo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao criar campo.' });
  }
};