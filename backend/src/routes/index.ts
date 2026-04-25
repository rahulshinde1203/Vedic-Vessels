import { Router, Request, Response } from 'express';
import productRoutes from '../modules/products/product.routes';
import orderRoutes   from '../modules/orders/order.routes';
import authRoutes    from '../modules/auth/auth.routes';
import paymentRoutes from '../modules/payment/payment.routes';
import addressRoutes from '../modules/address/address.routes';
import adminRoutes   from '../modules/admin/admin.routes';

const router = Router();

router.get('/health', (_req: Request, res: Response) => {
  res.json({ success: true, message: 'Server running' });
});

router.use('/auth',     authRoutes);
router.use('/products', productRoutes);
router.use('/orders',   orderRoutes);
router.use('/payment',  paymentRoutes);
router.use('/address',  addressRoutes);
router.use('/admin',    adminRoutes);

export default router;
