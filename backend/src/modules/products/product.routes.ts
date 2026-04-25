import { Router } from 'express';
import * as productController from './product.controller';

const router = Router();

router.get('/', productController.getProducts);
router.get('/:id', productController.getProduct);

export default router;
