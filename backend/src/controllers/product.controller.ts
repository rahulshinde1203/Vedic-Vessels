import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { cache } from '../config/redis';
import { AppError } from '../middleware/errorHandler';

const CATEGORY_SELECT = { id: true, name: true, slug: true } as const;

export const getProducts = async (req: Request, res: Response) => {
  const {
    page = '1',
    limit = '12',
    category = '',
    search = '',
    featured,
    sort = 'createdAt',
    order = 'desc',
  } = req.query as Record<string, string>;

  const cacheKey = `products:${category}:${search}:${featured}:${sort}:${order}:${page}:${limit}`;
  const cached = await cache.get(cacheKey);
  if (cached) {
    res.setHeader('X-Cache', 'HIT');
    return res.json(cached);
  }

  const skip = (Number(page) - 1) * Number(limit);
  const where: any = { isActive: true };
  if (category) where.category = { slug: category };
  if (search) where.OR = [
    { name: { contains: search, mode: 'insensitive' } },
    { description: { contains: search, mode: 'insensitive' } },
  ];
  if (featured === 'true') where.isFeatured = true;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        comparePrice: true,
        stock: true,
        images: true,
        isFeatured: true,
        createdAt: true,
        category: { select: CATEGORY_SELECT },
      },
      skip,
      take: Number(limit),
      orderBy: { [sort]: order },
    }),
    prisma.product.count({ where }),
  ]);

  const response = {
    success: true,
    data: products,
    meta: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) },
  };

  await cache.set(cacheKey, response, 120); // 2 min TTL
  res.setHeader('X-Cache', 'MISS');
  return res.json(response);
};

export const getProduct = async (req: Request, res: Response) => {
  const { slug } = req.params;
  const cacheKey = `product:${slug}`;
  const cached = await cache.get(cacheKey);
  if (cached) {
    res.setHeader('X-Cache', 'HIT');
    return res.json(cached);
  }

  const product = await prisma.product.findFirst({
    where: { slug, isActive: true },
    include: { category: true },
  });
  if (!product) throw new AppError('Product not found', 404);

  const response = { success: true, data: product };
  await cache.set(cacheKey, response, 300); // 5 min TTL
  res.setHeader('X-Cache', 'MISS');
  return res.json(response);
};

export const createProduct = async (req: Request, res: Response) => {
  const { name, description, price, comparePrice, stock, sku, images, categoryId, isFeatured } = req.body;
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  const product = await prisma.product.create({
    data: { name, slug, description, price, comparePrice, stock, sku, images: images || [], categoryId, isFeatured: isFeatured || false },
    include: { category: true },
  });

  await cache.delPattern('products:*');
  res.status(201).json({ success: true, data: product });
};

export const updateProduct = async (req: Request, res: Response) => {
  const product = await prisma.product.update({
    where: { id: req.params.id },
    data: req.body,
    include: { category: true },
  });

  await Promise.all([
    cache.del(`product:${product.slug}`),
    cache.delPattern('products:*'),
  ]);

  res.json({ success: true, data: product });
};

export const deleteProduct = async (req: Request, res: Response) => {
  const product = await prisma.product.update({
    where: { id: req.params.id },
    data: { isActive: false },
    select: { slug: true },
  });

  await Promise.all([
    cache.del(`product:${product.slug}`),
    cache.delPattern('products:*'),
  ]);

  res.json({ success: true, message: 'Product deactivated' });
};
