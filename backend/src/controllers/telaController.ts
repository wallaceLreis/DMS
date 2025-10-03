import { Request, Response } from 'express';
import pool from '../config/db';
import * as telaService from '../services/telaService';

export const getTelas = async (req: Request, res: Response) => {
  const { nome_tabela } = req.query;

  try {
    if (nome_tabela) {
      const tela = await telaService.findTelaByNomeTabela(String(nome_tabela));
      if (!tela) {
        return res.status(404).json({ message: "Tela não encontrada." });
      }
      return res.status(200).json([tela]);
    } else {
      const telas = await telaService.findAllTelas();
      return res.status(200).json(telas);
    }
  } catch (error) {
    console.error("Erro em getTelas:", error);
    return res.status(500).json({ message: 'Erro ao buscar telas.' });
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
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar detalhes da tela.' });
  }
};

export const createTela = async (req: Request, res: Response) => {
    try {
        const novaTela = await telaService.createTela(req.body);
        res.status(201).json(novaTela);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao criar tela.' });
    }
};

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

export const deleteTela = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const check = await pool.query('SELECT is_nativo FROM meta_telas WHERE tela_id = $1', [id]);
        if (check.rows[0]?.is_nativo) {
            return res.status(403).json({ message: 'Telas nativas não podem ser excluídas.' });
        }
        await pool.query('DELETE FROM meta_telas WHERE tela_id = $1', [id]);
        res.status(204).send();
    } catch (error) {
        console.error("Erro ao deletar tela:", error);
        res.status(500).json({ message: 'Erro ao deletar tela.' });
    }
};