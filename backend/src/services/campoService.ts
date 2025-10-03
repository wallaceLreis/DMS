// src/services/campoService.ts
import pool from '../config/db';

interface CampoData {
  nome_coluna: string;
  titulo_campo: string;
  tipo_dado: string;
  formato_campo: string;
  obrigatorio?: boolean;
}

export const createCampo = async (telaId: number, data: CampoData) => {
  const { nome_coluna, titulo_campo, tipo_dado, formato_campo, obrigatorio } = data;
  const result = await pool.query(
    `INSERT INTO meta_campos (tela_id, nome_coluna, titulo_campo, tipo_dado, formato_campo, obrigatorio)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [telaId, nome_coluna, titulo_campo, tipo_dado, formato_campo, obrigatorio]
  );
  return result.rows[0];
};

// (Funções para atualizar e deletar campos seriam adicionadas aqui no futuro)