// backend/src/routes/empresaRoutes.ts

import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { getEmpresas, createEmpresa, updateEmpresa, deleteEmpresa, getEmpresaById } from '../controllers/empresaController';

const router = Router();
router.use(protect);

router.route('/')
    .get(getEmpresas)
    .post(createEmpresa);

// CORREÇÃO DO BUG: Adicionado o método GET para buscar uma empresa por ID
router.route('/:id')
    .get(getEmpresaById) // <-- LINHA ADICIONADA
    .put(updateEmpresa)
    .delete(deleteEmpresa);

export default router;