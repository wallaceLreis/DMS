# DMS - Dynamic Management System

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

> Prova de Conceito (POC) de uma plataforma web integrada para gestão de produtos, estoque e cotação de fretes, voltada para pequenos centros de distribuição.

## Índice

- [1. Visão Geral](#1-visão-geral)
- [2. Funcionalidades](#2-funcionalidades)
- [3. Arquitetura e Tecnologias](#3-arquitetura-e-tecnologias)
- [4. Instruções de Instalação](#4-instruções-de-instalação)
- [5. Acesso ao Sistema](#5-acesso-ao-sistema)
- [6. Conclusão e Trabalhos Futuros](#6-conclusão-e-trabalhos-futuros)
- [7. Licença](#7-licença)

## 1. Visão Geral

A gestão eficiente de estoque e a otimização de processos logísticos são pilares para o sucesso de qualquer negócio de distribuição. Muitas empresas de pequeno e médio porte dependem de sistemas desconexos ou planilhas para gerenciar produtos, estoque e fretes, um processo manual, lento e propenso a erros.

O **DMS (Dynamic Management System)** foi criado para resolver esse problema, oferecendo uma plataforma web unificada que centraliza as operações essenciais de um pequeno centro de distribuição. O sistema integra o cadastro de produtos, controle de estoque e um fluxo completo de cotação de frete, culminando na geração de etiquetas de envio através da API da [Melhor Envio](https://melhorenvio.com.br/).

## 2. Funcionalidades

- **Gestão de Entidades**: CRUD completo para **Produtos** (com dimensões, peso, EAN) e **Empresas** (clientes, fornecedores).
- **Controle de Estoque Avançado**:
  - Registro de entradas e saídas manuais com histórico de movimentações.
  - **Estoque Físico**: Quantidade total de itens no armazém.
  - **Estoque Provisionado**: Itens alocados em cotações de frete aguardando envio.
  - **Estoque Disponível**: Saldo real para novas vendas (`Físico - Provisionado`).
- **Fluxo de Cotação e Frete**:
  - Criação de cotações com validação de estoque disponível em tempo real.
  - Integração com a API da Melhor Envio para cotação de fretes com múltiplas transportadoras.
  - Geração e impressão de etiquetas de envio.
  - Baixa automática do estoque (físico e provisionado) após a geração da etiqueta.
- **Ciclo de Vida das Cotações**:
  - Status: `CONCLUIDO`, `FINALIZADO` e `INVALIDA`.
  - Cotações não finalizadas são invalidadas automaticamente após 24 horas, liberando o estoque provisionado.
- **Autenticação Segura**: Acesso à API protegido por middleware com JSON Web Tokens (JWT).

## 3. Arquitetura e Tecnologias

O sistema adota uma arquitetura desacoplada com três componentes principais:

- **Frontend**: Uma Single Page Application (SPA) responsável pela interface e experiência do usuário.
  - **Framework**: React (com Vite)
  - **Linguagem**: TypeScript
  - **UI Library**: Material-UI (MUI)
  - **Outros**: `axios`, `react-router-dom`

- **Backend**: Uma API RESTful que concentra a lógica de negócio, autenticação e comunicação com serviços externos.
  - **Plataforma**: Node.js
  - **Framework**: Express.js
  - **Linguagem**: TypeScript
  - **Outros**: `jsonwebtoken`, `bcryptjs`, `axios`

- **Banco de Dados**: Um banco de dados relacional para persistência dos dados.
  - **SGBD**: PostgreSQL
  - **Driver**: `pg`

- **Ambiente e Ferramentas**:
  - **Containerização**: Docker e Docker Compose
  - **Controle de Versão**: Git

## 4. Instruções de Instalação

### Pré-requisitos

- Node.js (v18 ou superior)
- Docker e Docker Compose
- Git

### Passo a Passo

**1. Extraia os arquivos**

**2. Configure o Banco de Dados**

- Navegue até a pasta `DB/`.
- Crie um arquivo `.env` a partir do exemplo:

  ```bash
  # No Linux/macOS
  cp .env.example .env

  # No Windows
  copy .env.example .env
  ```

- Edite o arquivo `DB/.env` com suas credenciais:

  ```dotenv
  POSTGRES_USER=dms_user
  POSTGRES_PASSWORD=sua_senha_segura
  POSTGRES_DB=DMSPROD
  ```

**3. Configure o Backend**

- Navegue até a pasta `backend/`.
- Crie o arquivo `.env` a partir do exemplo e preencha as variáveis:

  ```dotenv
  # Server
  PORT=3001

  # Database Connection
  DB_HOST=localhost
  DB_PORT=5432
  DB_USER=dms_user
  DB_PASSWORD=sua_senha_segura
  DB_DATABASE=DMSPROD

  # Security
  JWT_SECRET=seu_segredo_jwt_super_secreto

  # Melhor Envio API
  MELHOR_ENVIO_TOKEN=seu_token_da_api_melhor_envio
  ```

**4. Execute os Serviços**

Abra 3 terminais separados.

- **Terminal 1: Banco de Dados**
  - Navegue até a pasta `DB/`.
  - Inicie o container do PostgreSQL. O script `init_database.sql` criará a estrutura e os dados iniciais automaticamente.
  ```bash
  docker-compose up -d
  ```

- **Terminal 2: Backend**
  - Navegue até a pasta `backend/`.
  - Instale as dependências e inicie o servidor.
  ```bash
  npm install
  npm run dev
  ```
  O backend estará rodando em `http://localhost:3001`.

- **Terminal 3: Frontend**
  - Navegue até a pasta `frontend/`.
  - Instale as dependências e inicie a aplicação.
  ```bash
  npm install
  npm run dev
  ```
  O frontend estará acessível em `http://localhost:5173`.

## 5. Acesso ao Sistema

1.  Abra seu navegador e acesse: `http://localhost:5173`.
2.  Use as credenciais padrão do superusuário para fazer login:
    - **Usuário**: `sup`
    - **Senha**: `123456`

> **Nota**: A senha `123456` corresponde ao hash gerado por `bcryptjs` e inserido no arquivo `DB/init_database.sql`.

## 6. Conclusão e Trabalhos Futuros

### Resultados Alcançados

O projeto DMS atingiu com sucesso seus objetivos como Prova de Conceito, entregando uma plataforma funcional que integra de forma coesa os principais processos de gestão de um pequeno negócio. O sistema demonstra a viabilidade da arquitetura proposta e resolve o problema central da descentralização de informações.

### Trabalhos Futuros

- **Dashboard Analítico**: Implementar um painel com métricas chave (ex: produtos mais vendidos, volume de expedição, custos de frete).
- **Gestão de Múltiplos Depósitos**: Evoluir o sistema para suportar operações com mais de um centro de distribuição.
- **Níveis de Acesso**: Criar diferentes perfis de usuário (ex: administrador, operador de estoque, financeiro) com permissões específicas.
- **Logs de Auditoria**: Registrar ações críticas dos usuários (ex: alterações de estoque, exclusão de produtos) para maior rastreabilidade.
- **Testes Automatizados**: Adicionar testes unitários e de integração para garantir a estabilidade e a qualidade do código.
- **Otimização de CI/CD**: Configurar um pipeline de integração e entrega contínua para automatizar o build e o deploy da aplicação.