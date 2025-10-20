// backend/src/routes/lookupRoutes.ts

import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { getEmpresas } from '../controllers/empresaController'; // Usamos a função principal que já existe

const router = Router();

// Aplica o middleware de proteção para garantir que apenas usuários logados possam acessar
router.use(protect);

// Rota para buscar empresas para preencher componentes (como Autocomplete)
// GET /api/lookup/empresas
router.get('/empresas', getEmpresas);

// No futuro, você pode adicionar outras rotas de consulta aqui. Ex:
// router.get('/produtos', getProdutos);

export default router;