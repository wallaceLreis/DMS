import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { getEstoqueAtual, createMovimento } from '../controllers/estoqueController';

const router = Router();
router.use(protect);

router.route('/')
    .get(getEstoqueAtual);

router.route('/movimento')
    .post(createMovimento);

export default router;