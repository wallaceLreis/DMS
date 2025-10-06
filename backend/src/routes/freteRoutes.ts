import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { calcularFrete } from '../controllers/freteController';

const router = Router();
router.use(protect);

router.route('/calcular')
    .post(calcularFrete);

export default router;