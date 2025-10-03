import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { getAcessosPorTela, createAcesso } from '../controllers/acessoController';

const router = Router();
router.use(protect);

router.route('/').get(getAcessosPorTela).post(createAcesso);

export default router;