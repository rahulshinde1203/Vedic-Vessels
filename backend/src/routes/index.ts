import { Router, Request, Response } from 'express';
import productRoutes from '../modules/products/product.routes';

const router = Router();

router.get('/health', (_req: Request, res: Response) => {
  res.json({ success: true, message: 'Server running' });
});

router.use('/products', productRoutes);

// Mount module routes here as they are implemented:
// router.use('/auth',       authRoutes);
// router.use('/categories', categoryRoutes);
// router.use('/orders',     orderRoutes);
// router.use('/users',      userRoutes);

export default router;
