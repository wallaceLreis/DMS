// src/routes/telaRoutes.ts
import { Router } from 'express';
import { getTelas, getTelaById } from '../controllers/telaController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// Aplicamos o middleware 'protect' a todas as rotas deste arquivo
// Apenas usuários com token válido poderão acessá-las
router.use(protect);

// Rota: GET /api/telas
router.get('/', getTelas);

// Rota: GET /api/telas/:id
router.get('/:id', getTelaById);

export default router;