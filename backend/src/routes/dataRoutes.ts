// backend/src/routes/dataRoutes.ts
import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { getGenericData, deleteGenericData } from '../controllers/dataController';

const router = Router();
router.use(protect);

router.get('/:tableName', getGenericData);
router.delete('/:tableName/:id', deleteGenericData); // <-- NOVA ROTA

export default router;