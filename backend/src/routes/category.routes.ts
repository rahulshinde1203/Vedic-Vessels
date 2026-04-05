import { Router } from 'express';
import { prisma } from '../config/prisma';
import { authenticate, requireAdmin } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();

router.get('/', async (_req, res) => {
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
  res.json({ success: true, data: categories });
});

router.post('/', authenticate, requireAdmin, async (req, res) => {
  const { name, description, imageUrl } = req.body;
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const category = await prisma.category.create({ data: { name, slug, description, imageUrl } });
  res.status(201).json({ success: true, data: category });
});

router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  const category = await prisma.category.update({ where: { id: req.params.id }, data: req.body });
  res.json({ success: true, data: category });
});

router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  await prisma.category.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: 'Category deleted' });
});

export default router;
