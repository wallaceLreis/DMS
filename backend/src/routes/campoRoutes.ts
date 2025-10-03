// src/routes/campoRoutes.ts
import { Router } from 'express';
import { createCampo } from '../controllers/campoController';

// O { mergeParams: true } é importante para que esta rota tenha acesso ao :telaId da rota pai
const router = Router({ mergeParams: true });

// Rota: POST /api/telas/:telaId/campos
router.post('/', createCampo);

export default router;