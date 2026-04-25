import { Router } from 'express';
import * as orderController from './order.controller';
import { authenticate } from '../../common/middleware/auth';

const router = Router();

router.post('/', authenticate, orderController.createOrder);

export default router;
