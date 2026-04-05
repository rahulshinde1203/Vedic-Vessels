import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const getCart = async (req: AuthRequest, res: Response) => {
  const cart = await prisma.cart.findUnique({
    where: { userId: req.user!.id },
    include: {
      items: {
        include: { product: { include: { category: true } } },
        orderBy: { createdAt: 'asc' },
      },
    },
  });
  res.json({ success: true, data: cart });
};

export const addToCart = async (req: AuthRequest, res: Response) => {
  const { productId, quantity = 1 } = req.body;

  const product = await prisma.product.findFirst({ where: { id: productId, isActive: true } });
  if (!product) throw new AppError('Product not found', 404);
  if (product.stock < quantity) throw new AppError('Insufficient stock', 400);

  let cart = await prisma.cart.findUnique({ where: { userId: req.user!.id } });
  if (!cart) cart = await prisma.cart.create({ data: { userId: req.user!.id } });

  const existingItem = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.id, productId } },
  });

  if (existingItem) {
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + quantity },
    });
  } else {
    await prisma.cartItem.create({ data: { cartId: cart.id, productId, quantity } });
  }

  const updatedCart = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: { items: { include: { product: true } } },
  });
  res.json({ success: true, data: updatedCart });
};

export const updateCartItem = async (req: AuthRequest, res: Response) => {
  const { quantity } = req.body;
  if (quantity < 1) throw new AppError('Quantity must be at least 1', 400);

  const item = await prisma.cartItem.update({
    where: { id: req.params.itemId },
    data: { quantity },
    include: { product: true },
  });
  res.json({ success: true, data: item });
};

export const removeFromCart = async (req: AuthRequest, res: Response) => {
  await prisma.cartItem.delete({ where: { id: req.params.itemId } });
  res.json({ success: true, message: 'Item removed from cart' });
};

export const clearCart = async (req: AuthRequest, res: Response) => {
  const cart = await prisma.cart.findUnique({ where: { userId: req.user!.id } });
  if (cart) await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  res.json({ success: true, message: 'Cart cleared' });
};
