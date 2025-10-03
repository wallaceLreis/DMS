// backend/src/index.ts
import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import telaRoutes from './routes/telaRoutes';
import dataRoutes from './routes/dataRoutes';
import usuarioRoutes from './routes/usuarioRoutes';
import acessoRoutes from './routes/acessoRoutes';
import morgan from 'morgan';

dotenv.config();
const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// ... resto do arquivo ...
app.use('/api/auth', authRoutes);
app.use('/api/telas', telaRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/acessos', acessoRoutes);

app.listen(port, () => {
  console.log(`🚀 Servidor DMS rodando na porta ${port}`);
});