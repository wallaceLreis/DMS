import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { createCotacao, getCotacoes, getCotacaoById } from '../controllers/freteController';

const router = Router();
router.use(protect);

router.route('/cotacoes')
    .get(getCotacoes)
    .post(createCotacao);

router.route('/cotacoes/:id')
    .get(getCotacaoById);

export default router;