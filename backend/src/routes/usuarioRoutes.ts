import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { getUsuarios, createUsuario } from '../controllers/usuarioController';

const router = Router();
router.use(protect);

router.route('/').get(getUsuarios).post(createUsuario);

export default router;