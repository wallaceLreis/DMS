import pool from '../config/db';

export const findAllTelas = async () => {
  const result = await pool.query('SELECT * FROM meta_telas ORDER BY titulo_tela');
  return result.rows;
};

export const findTelaById = async (telaId: number) => {
  const telaResult = await pool.query('SELECT * FROM meta_telas WHERE tela_id = $1', [telaId]);
  if (telaResult.rows.length === 0) {
    return null;
  }
  const tela = telaResult.rows[0];
  const camposResult = await pool.query(
    'SELECT * FROM meta_campos WHERE tela_id = $1 ORDER BY ordem_exibicao',
    [tela.tela_id]
  );
  tela.campos = camposResult.rows;
  return tela;
};

export const findTelaByNomeTabela = async (nomeTabela: string) => {
    const telaResult = await pool.query('SELECT * FROM meta_telas WHERE nome_tabela = $1', [nomeTabela]);
    if (telaResult.rows.length === 0) {
        return null;
    }
    const tela = telaResult.rows[0];
    const camposResult = await pool.query(
        'SELECT * FROM meta_campos WHERE tela_id = $1 ORDER BY ordem_exibicao',
        [tela.tela_id]
    );
    tela.campos = camposResult.rows;
    return tela;
};

export const createTela = async (data: { nome_tabela: string, titulo_tela: string, ativo?: boolean }) => {
  const { nome_tabela, titulo_tela, ativo } = data;
  const result = await pool.query(
    'INSERT INTO meta_telas (nome_tabela, titulo_tela, ativo) VALUES ($1, $2, $3) RETURNING *',
    [nome_tabela, titulo_tela, ativo]
  );
  return result.rows[0];
};

export const updateTela = async (telaId: number, data: { nome_tabela: string, titulo_tela: string, ativo: boolean }) => {
  const { nome_tabela, titulo_tela, ativo } = data;
  const result = await pool.query(
    'UPDATE meta_telas SET nome_tabela = $1, titulo_tela = $2, ativo = $3 WHERE tela_id = $4 RETURNING *',
    [nome_tabela, titulo_tela, ativo, telaId]
  );
  return result.rows[0];
};