// src/routes/telaRoutes.ts
import { Router } from 'express';
import { getTelas, getTelaById, createTela, updateTela } from '../controllers/telaController';
import { protect } from '../middleware/authMiddleware';
import campoRoutes from './campoRoutes'; // Importa as rotas dos campos

const router = Router();

router.use(protect); // Protege todas as rotas abaixo

// Rotas para as telas
router.route('/')
  .get(getTelas)
  .post(createTela);

router.route('/:id')
  .get(getTelaById)
  .put(updateTela);

// Usa as rotas de campos aninhadas sob uma tela específica
// Ex: /api/telas/1/campos
router.use('/:telaId/campos', campoRoutes);

export default router;