import prisma from '../../common/lib/prisma';
import type { ProductWithCategory } from './product.types';

const categorySelect = {
  select: { id: true, name: true },
} as const;

export async function getAllProducts(): Promise<ProductWithCategory[]> {
  return prisma.product.findMany({
    where: { isActive: true },
    include: { category: categorySelect },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getProductById(id: number): Promise<ProductWithCategory> {
  const product = await prisma.product.findFirst({
    where: { id, isActive: true },
    include: { category: categorySelect },
  });

  if (!product) {
    const err = new Error('Product not found');
    (err as any).statusCode = 404;
    throw err;
  }

  return product;
}
