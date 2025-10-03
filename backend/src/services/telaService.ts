// src/services/telaService.ts
import pool from '../config/db';

/**
 * Busca todas as telas cadastradas no dicionário de dados.
 */
export const findAllTelas = async () => {
  // LOG ADICIONADO para depuração
  console.log('LOG: [Service] Executando findAllTelas...'); 
  try {
    const result = await pool.query('SELECT * FROM meta_telas ORDER BY titulo_tela');
    // LOG ADICIONADO para depuração
    console.log(`LOG: [Service] Query executada. Encontradas ${result.rowCount ?? 0} linhas.`); 
    return result.rows;
  } catch (error) {
    // LOG ADICIONADO para depuração
    console.error('LOG DE ERRO: [Service] Erro ao executar a query no banco de dados:', error); 
    throw error; // Lança o erro para o controller tratar
  }
};

/**
 * Busca uma tela específica pelo seu ID, incluindo seus campos.
 */
export const findTelaById = async (telaId: number) => {
  const telaResult = await pool.query('SELECT * FROM meta_telas WHERE tela_id = $1', [telaId]);
  if (telaResult.rows.length === 0) {
    return null; // Retorna nulo se a tela não for encontrada
  }

  const camposResult = await pool.query(
    'SELECT * FROM meta_campos WHERE tela_id = $1 ORDER BY ordem_exibicao',
    [telaId]
  );

  const tela = telaResult.rows[0];
  tela.campos = camposResult.rows; // Adiciona a lista de campos ao objeto da tela

  return tela;
};

/**
 * Cria uma nova definição de tela no banco de dados.
 */
export const createTela = async (data: { nome_tabela: string, titulo_tela: string, ativo?: boolean }) => {
  const { nome_tabela, titulo_tela, ativo } = data;
  const result = await pool.query(
    'INSERT INTO meta_telas (nome_tabela, titulo_tela, ativo) VALUES ($1, $2, $3) RETURNING *',
    [nome_tabela, titulo_tela, ativo]
  );
  return result.rows[0];
};

/**
 * Atualiza uma definição de tela existente no banco de dados.
 */
export const updateTela = async (telaId: number, data: { nome_tabela: string, titulo_tela: string, ativo: boolean }) => {
  const { nome_tabela, titulo_tela, ativo } = data;
  const result = await pool.query(
    'UPDATE meta_telas SET nome_tabela = $1, titulo_tela = $2, ativo = $3 WHERE tela_id = $4 RETURNING *',
    [nome_tabela, titulo_tela, ativo, telaId]
  );
  return result.rows[0];
};