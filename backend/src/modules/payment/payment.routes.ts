import { Router } from 'express';
import * as paymentController from './payment.controller';
import { authenticate } from '../../common/middleware/auth';

const router = Router();

router.post('/create-order', authenticate, paymentController.createPaymentOrder);
router.post('/verify',       authenticate, paymentController.verifyPayment);

export default router;
