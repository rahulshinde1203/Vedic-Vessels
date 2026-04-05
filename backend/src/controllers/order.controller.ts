import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

const generateOrderNumber = () => `VV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

export const createOrder = async (req: AuthRequest, res: Response) => {
  const { addressId, notes } = req.body;
  const userId = req.user!.id;

  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: true } } },
  });
  if (!cart?.items.length) throw new AppError('Cart is empty', 400);

  const address = await prisma.address.findFirst({ where: { id: addressId, userId } });
  if (!address) throw new AppError('Address not found', 404);

  // Validate stock
  for (const item of cart.items) {
    if (item.product.stock < item.quantity) {
      throw new AppError(`Insufficient stock for ${item.product.name}`, 400);
    }
  }

  const subtotal = cart.items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);
  const shippingCost = subtotal > 999 ? 0 : 99;
  const tax = subtotal * 0.18;
  const total = subtotal + shippingCost + tax;

  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId,
        addressId,
        subtotal,
        shippingCost,
        tax,
        total,
        notes,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
            name: item.product.name,
            imageUrl: item.product.images[0] || null,
          })),
        },
      },
      include: { items: true, address: true },
    });

    // Decrement stock
    for (const item of cart.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    // Clear cart
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    return newOrder;
  });

  res.status(201).json({ success: true, data: order });
};

export const getOrders = async (req: AuthRequest, res: Response) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.user!.id },
    include: { items: true, address: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ success: true, data: orders });
};

export const getOrder = async (req: AuthRequest, res: Response) => {
  const order = await prisma.order.findFirst({
    where: { id: req.params.id, userId: req.user!.id },
    include: { items: { include: { product: true } }, address: true },
  });
  if (!order) throw new AppError('Order not found', 404);
  res.json({ success: true, data: order });
};
