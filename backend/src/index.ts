// src/index.ts
import express from 'express';
import * as dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import telaRoutes from './routes/telaRoutes'; // <--- IMPORTE AS NOVAS ROTAS

dotenv.config();
const app = express();
const port = process.env.PORT || 3001;
app.use(express.json());

// Rotas públicas
app.use('/api/auth', authRoutes);

// Rotas protegidas
app.use('/api/telas', telaRoutes); // <--- ADICIONE AS NOVAS ROTAS

app.listen(port, () => {
  console.log(`🚀 Servidor DMS rodando na porta ${port}`);
});