import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { getAcessosPorTela, createAcesso, updateAcesso, deleteAcesso } from '../controllers/acessoController';

const router = Router();
router.use(protect);

router.route('/')
    .get(getAcessosPorTela)
    .post(createAcesso);

router.route('/:acesso_id')
    .put(updateAcesso)
    .delete(deleteAcesso);

export default router;