// backend/src/routes/telaRoutes.ts
import { Router } from 'express';
import { getTelas, getTelaById, createTela, updateTela, deleteTela } from '../controllers/telaController';
import { protect } from '../middleware/authMiddleware';
import campoRoutes from './campoRoutes';

const router = Router();
router.use(protect);

router.route('/')
  .get(getTelas)
  .post(createTela);

router.route('/:id')
  .get(getTelaById)
  .put(updateTela)
  .delete(deleteTela); // <-- ROTA ADICIONADA

router.use('/:telaId/campos', campoRoutes);

export default router;