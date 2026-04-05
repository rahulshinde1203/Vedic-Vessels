import { Response } from 'express';
import { prisma } from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const getAddresses = async (req: AuthRequest, res: Response) => {
  const addresses = await prisma.address.findMany({
    where: { userId: req.user!.id },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  });
  res.json({ success: true, data: addresses });
};

export const createAddress = async (req: AuthRequest, res: Response) => {
  const { name, line1, line2, city, state, postalCode, country, phone, isDefault } = req.body;
  const userId = req.user!.id;

  if (isDefault) {
    await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
  }

  const hasExisting = await prisma.address.count({ where: { userId } });

  const address = await prisma.address.create({
    data: {
      userId, name, line1, line2, city, state,
      postalCode, country: country || 'India', phone,
      isDefault: isDefault || hasExisting === 0,
    },
  });
  res.status(201).json({ success: true, data: address });
};

export const updateAddress = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId  = req.user!.id;

  const existing = await prisma.address.findFirst({ where: { id, userId } });
  if (!existing) throw new AppError('Address not found', 404);

  if (req.body.isDefault) {
    await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
  }

  const address = await prisma.address.update({ where: { id }, data: req.body });
  res.json({ success: true, data: address });
};

export const deleteAddress = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId  = req.user!.id;

  const existing = await prisma.address.findFirst({ where: { id, userId } });
  if (!existing) throw new AppError('Address not found', 404);

  await prisma.address.delete({ where: { id } });
  res.json({ success: true, message: 'Address deleted' });
};

export const setDefaultAddress = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId  = req.user!.id;

  const existing = await prisma.address.findFirst({ where: { id, userId } });
  if (!existing) throw new AppError('Address not found', 404);

  await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
  const address = await prisma.address.update({ where: { id }, data: { isDefault: true } });
  res.json({ success: true, data: address });
};
