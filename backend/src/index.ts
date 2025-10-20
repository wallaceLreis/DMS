import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';

// Import de todas as nossas rotas
import authRoutes from './routes/authRoutes';
import telaRoutes from './routes/telaRoutes';
import dataRoutes from './routes/dataRoutes';
import usuarioRoutes from './routes/usuarioRoutes';
import acessoRoutes from './routes/acessoRoutes';
import produtoRoutes from './routes/produtoRoutes';
import estoqueRoutes from './routes/estoqueRoutes';
import freteRoutes from './routes/freteRoutes';
import empresaRoutes from './routes/empresaRoutes';
import lookupRoutes from './routes/lookupRoutes'; // <-- ROTA ADICIONADA

// Configuração inicial
dotenv.config();
const app = express();
const port = process.env.PORT || 3001;

// Middlewares essenciais
app.use(cors()); // Habilita o Cross-Origin Resource Sharing
app.use(express.json()); // Habilita o parse de JSON no corpo das requisições
app.use(morgan('dev')); // Habilita o log de requisições HTTP no console

// Middleware para servir arquivos estáticos (imagens dos produtos)
// Qualquer requisição para /files/... será servida a partir da pasta 'backend/public/'
app.use('/files', express.static(path.join(__dirname, '../public')));

// Registro de todas as rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/telas', telaRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/acessos', acessoRoutes);
app.use('/api/produtos', produtoRoutes);
app.use('/api/estoque', estoqueRoutes);
app.use('/api/frete', freteRoutes);
app.use('/api/empresas', empresaRoutes);
app.use('/api/lookup', lookupRoutes); // <-- ROTA ADICIONADA

// Inicia o servidor
app.listen(port, () => {
  console.log(`🚀 Servidor DMS rodando na porta ${port}`);
});