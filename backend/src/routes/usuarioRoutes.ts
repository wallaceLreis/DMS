import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { getUsuarios, createUsuario, deleteUsuario, changePassword, getMenuForCurrentUser } from '../controllers/usuarioController';

const router = Router();
router.use(protect);

// Rota para o menu do usuário logado (deve vir antes de /:id)
router.get('/me/menu', getMenuForCurrentUser);

// Rota para o usuário logado alterar a própria senha
router.put('/change-password', changePassword);

// Rotas de gestão de usuários (geralmente para admins)
router.route('/')
    .get(getUsuarios)
    .post(createUsuario);

router.route('/:id')
    .delete(deleteUsuario);

export default router;