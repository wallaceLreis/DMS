<h1 align="center">Sistema de Gestão (DMS)</h1>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18+-43853d.svg?style=for-the-badge&logo=node.js" alt="Node.js">
  <img src="https://img.shields.io/badge/React-18-61DAFB.svg?style=for-the-badge&logo=react" alt="React">
  <img src="https://img.shields.io/badge/PostgreSQL-15-336791.svg?style=for-the-badge&logo=postgresql" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Docker-20.10+-2496ED.svg?style=for-the-badge&logo=docker" alt="Docker">
  <img src="https://img.shields.io/badge/licen%C3%A7a-ISC-blue.svg?style=for-the-badge" alt="Licença ISC">
</p>

<p align="center">
  Um sistema completo de gestão empresarial (DMS) com backend em Node.js/TypeScript, frontend em React/TypeScript e banco de dados PostgreSQL.
</p>

🏗️ Arquitetura do Projeto
A estrutura de diretórios principal do projeto é organizada da seguinte forma:

```bash
robertocjunior-dms/
├── backend/   # API REST em Node.js + TypeScript
├── frontend/  # Interface do usuário em React + TypeScript
└── DB/        # Configuração do PostgreSQL com Docker
```

🚀 Funcionalidades Principais
*   **Autenticação:** Login seguro de usuários com tokens JWT.
*   **Gestão de Usuários:** CRUD completo com diferentes níveis de acesso.
*   **Gestão de Empresas:** Cadastro e gerenciamento de múltiplas empresas.
*   **Gestão de Produtos:** Cadastro de produtos com imagens e múltiplas unidades de medida.
*   **Controle de Estoque:** Rastreamento de movimentações e saldo atual.
*   **Telas Dinâmicas:** Sistema para configurar campos de tela personalizados.
*   **Cotações de Frete:** Integração com sistemas de transporte para cálculo de frete.
*   **Controle de Acessos:** Gestão granular de permissões por tela e por usuário.

🛠️ Tecnologias Utilizadas
Backend
Node.js + TypeScript

Express.js - Framework web

PostgreSQL - Banco de dados relacional

JWT - Autenticação

bcryptjs - Criptografia de senhas

Multer - Upload de arquivos

CORS - Controle de acesso entre domínios

Frontend
React 18 + TypeScript

Vite - Build tool e dev server

React Router - Navegação SPA

Material-UI - Componentes de interface

Axios - Cliente HTTP

Infraestrutura
Docker + Docker Compose - Containerização do PostgreSQL

PostgreSQL 15 - Banco de dados

📋 Pré-requisitos
Node.js 18+

Docker e Docker Compose

PostgreSQL 15 (via Docker)

🚀 Como Executar o Projeto
1. Configuração do Banco de Dados
bash
# Navegue até a pasta do banco de dados
cd DB

# Crie um arquivo .env com as variáveis de ambiente
cp .env.example .env

# Edite o .env com suas configurações:
# POSTGRES_DB=dms_database
# POSTGRES_USER=seu_usuario
# POSTGRES_PASSWORD=sua_senha_segura

# Inicie o container do PostgreSQL
docker-compose up -d
2. Configuração do Backend
bash
# Navegue até a pasta do backend
cd backend

# Instale as dependências
npm install

# Crie o arquivo .env
cp .env.example .env

# Configure as variáveis de ambiente no .env:
# DB_HOST=localhost
# DB_PORT=5432
# DB_USER=seu_usuario
# DB_PASSWORD=sua_senha_segura
# DB_DATABASE=dms_database
# JWT_SECRET=seu_jwt_secret_super_seguro

# Execute o backend
npm start
O backend estará disponível em: http://localhost:3001

3. Configuração do Frontend
bash
# Navegue até a pasta do frontend
cd frontend

# Instale as dependências
npm install

# Execute o frontend em modo desenvolvimento
npm run dev
O frontend estará disponível em: http://localhost:5173

🔐 Primeiro Acesso
Criando um Usuário Administrador
Gere o hash da senha:

bash
cd backend
node generateHash.js sua_senha_admin
Insira manualmente no banco de dados:

sql
INSERT INTO dms_usuarios (username, password_hash, role, ativo) 
VALUES ('admin', '<hash_gerado>', 'admin', true);
Faça login no sistema:

URL: http://localhost:5173

Usuário: admin

Senha: sua_senha_admin

📊 Estrutura do Banco de Dados
O sistema utiliza as seguintes tabelas principais:

dms_usuarios - Usuários do sistema

empresas - Cadastro de empresas

produtos - Cadastro de produtos

unidades - Unidades de medida dos produtos

estoque_movimentos - Movimentações de estoque

meta_telas - Configuração de telas dinâmicas

meta_campos - Campos personalizados das telas

acessos - Controle de permissões

🔧 Desenvolvimento
Scripts Disponíveis
Backend:

bash
npm start          # Executa em produção
npm run dev        # Executa em desenvolvimento (se configurado)
Frontend:

bash
npm run dev        # Desenvolvimento
npm run build      # Build para produção
npm run preview    # Preview do build
Variáveis de Ambiente
Backend (.env):

env
DB_HOST=localhost
DB_PORT=5432
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_DATABASE=dms_database
JWT_SECRET=seu_jwt_secret
DB (.env):

env
POSTGRES_DB=dms_database
POSTGRES_USER=seu_usuario
POSTGRES_PASSWORD=sua_senha
🗃️ API Endpoints Principais
Autenticação
POST /api/auth/login - Login de usuário

Gestão de Usuários
GET /api/usuarios/me/menu - Menu do usuário logado

PUT /api/usuarios/change-password - Alterar senha

GET /api/usuarios - Listar usuários

POST /api/usuarios - Criar usuário

Produtos
GET /api/produtos - Listar produtos

POST /api/produtos - Criar produto (com upload de imagem)

GET /api/produtos/:id - Buscar produto por ID

PUT /api/produtos/:id - Atualizar produto

DELETE /api/produtos/:id - Excluir produto

Empresas
GET /api/empresas - Listar empresas

POST /api/empresas - Criar empresa

PUT /api/empresas/:id - Atualizar empresa

DELETE /api/empresas/:id - Excluir empresa

🐛 Solução de Problemas
Problemas Comuns
Erro de conexão com o banco:

Verifique se o container do PostgreSQL está rodando

Confirme as credenciais no arquivo .env do backend

Portas em uso:

Backend: 3001

Frontend: 5173

PostgreSQL: 5432

Problemas de CORS:

Verifique a configuração CORS no backend

📝 Próximos Passos
Implementar testes automatizados

Configurar ambiente de produção

Adicionar documentação da API (Swagger)

Implementar backup automático do banco

Adicionar logging centralizado

🤝 Contribuição
Fork o projeto

Crie uma branch para sua feature (git checkout -b feature/AmazingFeature)

Commit suas mudanças (git commit -m 'Add some AmazingFeature')

Push para a branch (git push origin feature/AmazingFeature)

Abra um Pull Request

📄 Licença
Este projeto está sob licença ISC. Veja o arquivo LICENSE para mais detalhes.