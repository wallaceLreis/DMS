// backend/src/controllers/campoController.ts
import { Request, Response } from 'express';
import pool from '../config/db';

export const createCampo = async (req: Request, res: Response) => {
  try {
    const { telaId } = req.params;
    const { nome_coluna, titulo_campo, tipo_dado, formato_campo } = req.body;
    
    // Novos campos criados pelo usuário nunca são nativos
    const is_nativo = false;

    const novoCampo = await pool.query(
      `INSERT INTO meta_campos (tela_id, nome_coluna, titulo_campo, tipo_dado, formato_campo, is_nativo)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [telaId, nome_coluna, titulo_campo, tipo_dado, formato_campo, is_nativo]
    );
    res.status(201).json(novoCampo.rows[0]);
  } catch (error) {
    console.error("Erro ao criar campo:", error);
    res.status(500).json({ message: 'Erro ao criar campo.' });
  }
};

export const updateCampo = async (req: Request, res: Response) => {
    const { campoId } = req.params;
    const { titulo_campo, tipo_dado, formato_campo } = req.body;

    try {
        // Regra de Segurança: Impede a alteração de campos nativos
        const check = await pool.query('SELECT is_nativo FROM meta_campos WHERE campo_id = $1', [campoId]);
        if (check.rows.length > 0 && check.rows[0].is_nativo) {
            return res.status(403).json({ message: 'Campos nativos não podem ser alterados.' });
        }

        const result = await pool.query(
            'UPDATE meta_campos SET titulo_campo = $1, tipo_dado = $2, formato_campo = $3 WHERE campo_id = $4 RETURNING *',
            [titulo_campo, tipo_dado, formato_campo, campoId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Campo não encontrado.'});
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error("Erro ao atualizar campo:", error);
        res.status(500).json({ message: 'Erro ao atualizar campo.' });
    }
};

export const deleteCampo = async (req: Request, res: Response) => {
    const { campoId } = req.params;
    
    try {
        // Regra de Segurança: Impede a exclusão de campos nativos
        const check = await pool.query('SELECT is_nativo FROM meta_campos WHERE campo_id = $1', [campoId]);
        if (check.rows.length > 0 && check.rows[0].is_nativo) {
            return res.status(403).json({ message: 'Campos nativos não podem ser excluídos.' });
        }

        const result = await pool.query('DELETE FROM meta_campos WHERE campo_id = $1', [campoId]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Campo não encontrado.'});
        }
        res.status(204).send(); // 204 No Content
    } catch (error) {
        console.error("Erro ao deletar campo:", error);
        res.status(500).json({ message: 'Erro ao deletar campo.' });
    }
};