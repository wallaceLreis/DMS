import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { protect } from '../middleware/authMiddleware';
import { getProdutos, createProduto, updateProduto, deleteProduto } from '../controllers/produtoController';

const router = Router();

const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: (req, file, cb) => {
        cb(null, `produto-${Date.now()}${path.extname(file.originalname)}`);
    }
});
const upload = multer({ storage });

router.use(protect);

router.route('/')
    .get(getProdutos)
    .post(upload.single('imagem'), createProduto);

router.route('/:id')
    .put(upload.single('imagem'), updateProduto)
    .delete(deleteProduto);

export default router;