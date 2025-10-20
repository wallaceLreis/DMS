// backend/src/routes/freteRoutes.ts

import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { createCotacao, getCotacoes, getCotacaoById, generateLabel } from '../controllers/freteController';

const router = Router();
router.use(protect);

router.route('/cotacoes')
    .get(getCotacoes)
    .post(createCotacao);

router.route('/cotacoes/:id')
    .get(getCotacaoById);

// NOVA ROTA PARA GERAR ETIQUETA
router.post('/gerar-etiqueta', generateLabel);

export default router;