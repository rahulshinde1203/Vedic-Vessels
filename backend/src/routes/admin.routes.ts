import { Router } from 'express';
import { prisma } from '../config/prisma';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();
router.use(authenticate, requireAdmin);

// Dashboard stats
router.get('/stats', async (_req, res) => {
  const [totalUsers, totalOrders, totalProducts, recentOrders] = await Promise.all([
    prisma.user.count(),
    prisma.order.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } }, items: true },
    }),
  ]);

  const revenue = await prisma.order.aggregate({
    _sum: { total: true },
    where: { status: { not: 'CANCELLED' } },
  });

  res.json({
    success: true,
    data: {
      totalUsers,
      totalOrders,
      totalProducts,
      totalRevenue: revenue._sum.total || 0,
      recentOrders,
    },
  });
});

// All orders (admin)
router.get('/orders', async (req, res) => {
  const { page = '1', limit = '20', status } = req.query;
  const where = status ? { status: status as any } : {};
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { user: { select: { name: true, email: true } }, items: true, address: true },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
    }),
    prisma.order.count({ where }),
  ]);
  res.json({ success: true, data: orders, meta: { total, page: Number(page) } });
});

// Update order status
router.patch('/orders/:id/status', async (req, res) => {
  const order = await prisma.order.update({
    where: { id: req.params.id },
    data: { status: req.body.status },
  });
  res.json({ success: true, data: order });
});

// All users (admin)
router.get('/users', async (req, res) => {
  const { page = '1', limit = '20' } = req.query;
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, createdAt: true, _count: { select: { orders: true } } },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count(),
  ]);
  res.json({ success: true, data: users, meta: { total, page: Number(page) } });
});

export default router;
