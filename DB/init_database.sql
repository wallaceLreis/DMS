-- =================================================
-- Criação do Banco de Dados DMSPROD
-- =================================================

CREATE DATABASE DMSPROD;

\c DMSPROD;

-- =================================================
-- Tabelas
-- =================================================

-- dms_usuarios
CREATE TABLE dms_usuarios (
    usuario_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' NOT NULL,
    ativo BOOLEAN DEFAULT true,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_nativo BOOLEAN DEFAULT false NOT NULL
);

-- meta_telas
CREATE TABLE meta_telas (
    tela_id SERIAL PRIMARY KEY,
    nome_tabela VARCHAR(100) UNIQUE NOT NULL,
    titulo_tela VARCHAR(100) NOT NULL,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ativo BOOLEAN DEFAULT true NOT NULL,
    is_nativo BOOLEAN DEFAULT false NOT NULL
);

-- meta_campos
CREATE TABLE meta_campos (
    campo_id SERIAL PRIMARY KEY,
    tela_id INTEGER NOT NULL REFERENCES meta_telas(tela_id) ON DELETE CASCADE,
    nome_coluna VARCHAR(100) NOT NULL,
    titulo_campo VARCHAR(100) NOT NULL,
    tipo_dado VARCHAR(50) NOT NULL,
    formato_campo VARCHAR(50),
    ordem_exibicao INTEGER DEFAULT 0,
    obrigatorio BOOLEAN DEFAULT false,
    is_nativo BOOLEAN DEFAULT false NOT NULL,
    UNIQUE(tela_id, nome_coluna)
);

-- dms_acessos
CREATE TABLE dms_acessos (
    acesso_id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES dms_usuarios(usuario_id) ON DELETE CASCADE,
    tela_id INTEGER NOT NULL REFERENCES meta_telas(tela_id) ON DELETE CASCADE,
    pode_incluir BOOLEAN DEFAULT false NOT NULL,
    pode_alterar BOOLEAN DEFAULT false NOT NULL,
    pode_excluir BOOLEAN DEFAULT false NOT NULL,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(usuario_id, tela_id)
);

-- empresas
CREATE TABLE empresas (
    empresa_id SERIAL PRIMARY KEY,
    nome_fantasia VARCHAR(255) NOT NULL,
    razao_social VARCHAR(255) NOT NULL,
    cnpj VARCHAR(18) UNIQUE NOT NULL,
    email VARCHAR(255),
    telefone VARCHAR(20), -- <<< NOVA COLUNA
    cep VARCHAR(9),
    logouro VARCHAR(255),
    numero VARCHAR(20),
    complemento VARCHAR(100),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    uf CHAR(2),
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ativo BOOLEAN DEFAULT true
);

-- produtos
CREATE TABLE produtos (
    produto_id SERIAL PRIMARY KEY,
    codigo BIGINT UNIQUE NOT NULL,
    nome VARCHAR(255) NOT NULL,
    ean VARCHAR(14) NOT NULL,
    imagem_url VARCHAR(255),
    altura NUMERIC(10,2) NOT NULL,
    largura NUMERIC(10,2) NOT NULL,
    profundidade NUMERIC(10,2) NOT NULL,
    peso NUMERIC(10,3) NOT NULL,
    estoque_total NUMERIC(10,3) NOT NULL DEFAULT 0,
    estoque_provisionado NUMERIC(10,3) NOT NULL DEFAULT 0,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- estoque_movimentos
CREATE TABLE estoque_movimentos (
    movimento_id SERIAL PRIMARY KEY,
    produto_id INTEGER NOT NULL REFERENCES produtos(produto_id) ON DELETE RESTRICT,
    usuario_id INTEGER NOT NULL REFERENCES dms_usuarios(usuario_id) ON DELETE RESTRICT,
    tipo_movimento VARCHAR(10) NOT NULL,
    quantidade NUMERIC(10,3) NOT NULL,
    data_movimento TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    observacao TEXT,
    numero_nota VARCHAR(50)
);

-- meta_relacionamentos
CREATE TABLE meta_relacionamentos (
    rel_id SERIAL PRIMARY KEY,
    tela_pai_id INTEGER NOT NULL REFERENCES meta_telas(tela_id) ON DELETE RESTRICT,
    tela_filho_id INTEGER NOT NULL REFERENCES meta_telas(tela_id) ON DELETE RESTRICT,
    coluna_chave_pai VARCHAR(100) NOT NULL,
    coluna_chave_filho VARCHAR(100) NOT NULL
);

-- cotacoes
CREATE TABLE cotacoes (
    cotacao_id SERIAL PRIMARY KEY,
    empresa_origem_id INTEGER NOT NULL REFERENCES empresas(empresa_id) ON DELETE RESTRICT,
    cep_destino VARCHAR(9) NOT NULL,
    destinatario VARCHAR(255),
    destinatario_sobrenome VARCHAR(255), -- <<< NOVA COLUNA
    order_id VARCHAR(255), -- <<< NOVA COLUNA (para reimpressão da etiqueta)
    status VARCHAR(20) DEFAULT 'PROCESSANDO' NOT NULL, -- Valores podem ser PROCESSANDO, CONCLUIDO, ERRO, FINALIZADO
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- cotacao_itens
CREATE TABLE cotacao_itens (
    item_id SERIAL PRIMARY KEY,
    cotacao_id INTEGER NOT NULL REFERENCES cotacoes(cotacao_id) ON DELETE RESTRICT,
    produto_id INTEGER NOT NULL REFERENCES produtos(produto_id) ON DELETE RESTRICT,
    quantidade INTEGER NOT NULL
);

-- cotacao_resultados
CREATE TABLE cotacao_resultados (
    resultado_id SERIAL PRIMARY KEY,
    cotacao_id INTEGER NOT NULL REFERENCES cotacoes(cotacao_id) ON DELETE RESTRICT,
    service_id INTEGER, -- <<< NOVA COLUNA
    transportadora VARCHAR(100),
    servico VARCHAR(100),
    preco NUMERIC(10,2),
    prazo_entrega INTEGER,
    url_logo VARCHAR(255)
);

-- =================================================
-- Dados iniciais EXATOS do seu sistema
-- =================================================

-- Inserir usuário sup (EXATO do seu dump)
INSERT INTO dms_usuarios (usuario_id, username, password_hash, role, ativo, is_nativo) 
VALUES (
    1,
    'sup', 
    '$2b$10$Vt8uxnAK4NTrVlKrYM8xguAiqIof/VE6l8Y6WsRZ4cBQZByJMKr6m',
    'sup',
    true,
    true
);

-- Inserir telas EXATAS do seu sistema
INSERT INTO meta_telas (tela_id, nome_tabela, titulo_tela, is_nativo) VALUES
(1, 'dicionario', 'Dicionário de Dados', true),
(2, 'usuarios', 'Gestão de Usuários', true),
(3, 'acessos', 'Gestão de Acessos', true),
(4, 'produtos', 'Cadastro de Produtos', true),
(5, 'estoque', 'Controle de Estoque', true),
(6, 'cotacao-frete', 'Cotação de Frete', true),
(7, 'empresas', 'Cadastro de Empresas', true);

-- Inserir acessos totais para o usuário sup em TODAS as telas
INSERT INTO dms_acessos (usuario_id, tela_id, pode_incluir, pode_alterar, pode_excluir) VALUES
(1, 1, true, true, true),
(1, 2, true, true, true),
(1, 3, true, true, true),
(1, 4, true, true, true),
(1, 5, true, true, true),
(1, 6, true, true, true),
(1, 7, true, true, true);

-- =================================================
-- Ajustar sequences para os IDs corretos
-- =================================================
SELECT setval('dms_usuarios_usuario_id_seq', 1, true);
SELECT setval('meta_telas_tela_id_seq', 7, true);
SELECT setval('dms_acessos_acesso_id_seq', 7, true);
SELECT setval('empresas_empresa_id_seq', 1, false);
SELECT setval('produtos_produto_id_seq', 1, false);
SELECT setval('estoque_movimentos_movimento_id_seq', 1, false);
SELECT setval('meta_campos_campo_id_seq', 1, false);
SELECT setval('meta_relacionamentos_rel_id_seq', 1, false);
SELECT setval('cotacoes_cotacao_id_seq', 1, false);
SELECT setval('cotacao_itens_item_id_seq', 1, false);
SELECT setval('cotacao_resultados_resultado_id_seq', 1, false);

-- =================================================
-- Índices para performance
-- =================================================
CREATE INDEX idx_usuarios_username ON dms_usuarios(username);
CREATE INDEX idx_produtos_codigo ON produtos(codigo);
CREATE INDEX idx_telas_nome_tabela ON meta_telas(nome_tabela);
CREATE INDEX idx_campos_tela ON meta_campos(tela_id);
CREATE INDEX idx_acessos_usuario_tela ON dms_acessos(usuario_id, tela_id);
CREATE INDEX idx_estoque_produto ON estoque_movimentos(produto_id);
CREATE INDEX idx_estoque_data ON estoque_movimentos(data_movimento);
CREATE INDEX idx_cotacoes_empresa ON cotacoes(empresa_origem_id);
CREATE INDEX idx_cotacao_itens_cotacao ON cotacao_itens(cotacao_id);
CREATE INDEX idx_cotacao_itens_produto ON cotacao_itens(produto_id);

-- =================================================
-- Grants (Assumindo que seu usuário é dms_user)
-- =================================================
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO dms_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO dms_user;
-- GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO dms_user;

-- =================================================
-- Comentários explicativos sobre as regras
-- =================================================
COMMENT ON CONSTRAINT dms_acessos_usuario_id_fkey ON dms_acessos IS 'Não permite excluir usuário que tenha acessos';
COMMENT ON CONSTRAINT dms_acessos_tela_id_fkey ON dms_acessos IS 'Não permite excluir tela que tenha acessos';
COMMENT ON CONSTRAINT estoque_movimentos_produto_id_fkey ON estoque_movimentos IS 'Não permite excluir produto que tenha movimentos de estoque';
COMMENT ON CONSTRAINT estoque_movimentos_usuario_id_fkey ON estoque_movimentos IS 'Não permite excluir usuário que tenha movimentos de estoque';
COMMENT ON CONSTRAINT cotacoes_empresa_origem_id_fkey ON cotacoes IS 'Não permite excluir empresa que tenha cotações';
COMMENT ON CONSTRAINT cotacao_itens_cotacao_id_fkey ON cotacao_itens IS 'Não permite excluir cotação que tenha itens';
COMMENT ON CONSTRAINT cotacao_itens_produto_id_fkey ON cotacao_itens IS 'Não permite excluir produto que esteja em itens de cotação';
COMMENT ON CONSTRAINT cotacao_resultados_cotacao_id_fkey ON cotacao_resultados IS 'Não permite excluir cotação que tenha resultados';
COMMENT ON CONSTRAINT meta_relacionamentos_tela_pai_id_fkey ON meta_relacionamentos IS 'Não permite excluir tela que seja pai em relacionamento';
COMMENT ON CONSTRAINT meta_relacionamentos_tela_filho_id_fkey ON meta_relacionamentos IS 'Não permite excluir tela que seja filho em relacionamento';