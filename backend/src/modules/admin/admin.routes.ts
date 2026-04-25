import { Router } from 'express';
import { authenticate }  from '../../common/middleware/auth';
import { requireAdmin }  from '../../common/middleware/requireAdmin';
import { imageUpload }   from '../../common/middleware/upload';
import * as ctrl         from './admin.controller';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/stats', ctrl.getStats);

router.get('/products',               ctrl.getProducts);
router.post('/products',              imageUpload.array('images', 5), ctrl.createProduct);
router.patch('/products/:id',         imageUpload.array('images', 5), ctrl.updateProduct);
router.delete('/products/:id',        ctrl.deleteProduct);

router.get('/categories',   ctrl.getCategories);
router.post('/categories',  ctrl.createCategory);

router.get('/orders',       ctrl.getOrders);
router.get('/orders/:id',   ctrl.getOrderById);
router.patch('/orders/:id', ctrl.updateOrderStatus);

router.get('/users',        ctrl.getUsers);

router.get('/support',          ctrl.getAdminTickets);
router.get('/support/:id',      ctrl.getAdminTicketById);
router.patch('/support/:id',    ctrl.updateTicketStatus);
router.post('/support/:id/reply', ctrl.addAdminTicketReply);

export default router;
