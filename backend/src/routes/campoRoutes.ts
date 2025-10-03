// backend/src/routes/campoRoutes.ts
import { Router } from 'express';
import { createCampo, updateCampo, deleteCampo } from '../controllers/campoController';

// O { mergeParams: true } é crucial para que esta rota tenha acesso ao :telaId da rota pai
const router = Router({ mergeParams: true });

// Rota para: POST /api/telas/:telaId/campos
router.route('/')
    .post(createCampo);

// Rotas para: PUT, DELETE /api/telas/:telaId/campos/:campoId
router.route('/:campoId')
    .put(updateCampo)
    .delete(deleteCampo);

export default router;