// backend/src/routes/dataRoutes.ts
import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { getGenericData } from '../controllers/dataController';

const router = Router();
router.use(protect);

// Rota GET /api/data/:tableName
router.get('/:tableName', getGenericData);

export default router;