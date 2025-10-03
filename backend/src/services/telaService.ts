// src/services/telaService.ts
import pool from '../config/db';

// Lista todas as telas
export const findAllTelas = async () => {
  const result = await pool.query('SELECT * FROM meta_telas ORDER BY titulo_tela');
  return result.rows;
};

// Busca uma tela específica com todos os seus campos
export const findTelaById = async (telaId: number) => {
  const telaResult = await pool.query('SELECT * FROM meta_telas WHERE tela_id = $1', [telaId]);
  if (telaResult.rows.length === 0) {
    return null; // Tela não encontrada
  }

  const camposResult = await pool.query(
    'SELECT * FROM meta_campos WHERE tela_id = $1 ORDER BY ordem_exibicao',
    [telaId]
  );

  const tela = telaResult.rows[0];
  tela.campos = camposResult.rows; // Adiciona os campos ao objeto da tela

  return tela;
};