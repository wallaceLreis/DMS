// backend/src/routes/freteRoutes.ts

import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { createCotacao, getCotacoes, getCotacaoById, generateLabel, reprintLabel } from '../controllers/freteController';

const router = Router();
router.use(protect);

router.route('/cotacoes')
    .get(getCotacoes)
    .post(createCotacao);

router.route('/cotacoes/:id')
    .get(getCotacaoById);

router.post('/gerar-etiqueta', generateLabel);

router.get('/reimprimir-etiqueta/:cotacao_id', reprintLabel);

export default router;