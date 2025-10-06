import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { getEmpresas, createEmpresa, updateEmpresa, deleteEmpresa } from '../controllers/empresaController';

const router = Router();
router.use(protect);

router.route('/')
    .get(getEmpresas)
    .post(createEmpresa);

router.route('/:id')
    .put(updateEmpresa)
    .delete(deleteEmpresa);

export default router;