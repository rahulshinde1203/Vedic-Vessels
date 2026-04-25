import { Router } from 'express';
import * as orderController from './order.controller';
import { authenticate } from '../../common/middleware/auth';

const router = Router();

router.post('/',    authenticate, orderController.createOrder);
// /my must be before /:id to avoid being matched as an id
router.get('/my',   authenticate, orderController.getMyOrders);
router.get('/:id',  authenticate, orderController.getMyOrderById);

export default router;
