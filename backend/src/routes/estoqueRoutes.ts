import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { getEstoqueAtual, createMovimento, getMovimentosPorProduto } from '../controllers/estoqueController';

const router = Router();
router.use(protect);

router.route('/')
    .get(getEstoqueAtual);

router.route('/movimento')
    .post(createMovimento);

// NOVA ROTA
router.route('/:produto_id/movimentos')
    .get(getMovimentosPorProduto);

export default router;