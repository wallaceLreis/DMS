// src/controllers/telaController.ts
import { Request, Response } from 'express';
import * as telaService from '../services/telaService';

/**
 * Controlador para buscar e retornar a lista de todas as telas.
 */
export const getTelas = async (req: Request, res: Response) => {
  // LOG ADICIONADO para depuração
  console.log('LOG: [Controller] Acessando a rota getTelas...'); 
  try {
    const telas = await telaService.findAllTelas();
    // LOG ADICIONADO para depuração
    console.log('LOG: [Controller] Serviço retornou os dados. Enviando resposta...'); 
    res.status(200).json(telas);
  } catch (error) {
    // LOG ADICIONADO para depuração
    console.error('LOG DE ERRO: [Controller] Ocorreu um erro:', error); 
    res.status(500).json({ message: 'Erro ao buscar telas.' });
  }
};

/**
 * Controlador para buscar e retornar os detalhes de uma tela específica.
 */
export const getTelaById = async (req: Request, res: Response) => {
  try {
    const telaId = parseInt(req.params.id, 10);
    const tela = await telaService.findTelaById(telaId);

    if (!tela) {
      return res.status(404).json({ message: 'Tela não encontrada.' });
    }

    res.status(200).json(tela);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar detalhes da tela.' });
  }
};

/**
 * Controlador para criar uma nova tela.
 */
export const createTela = async (req: Request, res: Response) => {
    try {
        const novaTela = await telaService.createTela(req.body);
        res.status(201).json(novaTela);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao criar tela.' });
    }
};

/**
 * Controlador para atualizar uma tela existente.
 */
export const updateTela = async (req: Request, res: Response) => {
    try {
        const telaId = parseInt(req.params.id, 10);
        const telaAtualizada = await telaService.updateTela(telaId, req.body);
        if (!telaAtualizada) {
            return res.status(404).json({ message: 'Tela não encontrada.' });
        }
        res.status(200).json(telaAtualizada);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao atualizar tela.' });
    }
};