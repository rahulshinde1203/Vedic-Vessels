import prisma from '../../common/lib/prisma';
import type { CreateAddressBody, UpdateAddressBody } from './address.types';

function makeError(message: string, statusCode: number): Error {
  const err = new Error(message);
  (err as any).statusCode = statusCode;
  return err;
}

function validateAddress(body: CreateAddressBody): void {
  if (!body.fullName?.trim())   throw makeError('Full name is required', 400);
  if (!body.phone?.trim())      throw makeError('Phone number is required', 400);
  if (!/^[+]?[\d\s\-() ]{10,15}$/.test(body.phone.replace(/[\s\-()]/g, ''))) {
    throw makeError('Enter a valid phone number (10–13 digits)', 400);
  }
  if (!body.address?.trim())    throw makeError('Address is required', 400);
  if (!body.city?.trim())       throw makeError('City is required', 400);
  if (!body.state?.trim())      throw makeError('State is required', 400);
  if (!body.pincode?.trim())    throw makeError('Pincode is required', 400);
  if (!/^[1-9][0-9]{5}$/.test(body.pincode.trim())) {
    throw makeError('Enter a valid 6-digit pincode', 400);
  }
}

export async function createAddress(userId: number, body: CreateAddressBody) {
  validateAddress(body);

  // If this is the first address, make it default automatically
  const existing = await prisma.address.count({ where: { userId } });

  return prisma.address.create({
    data: {
      userId,
      fullName:  body.fullName.trim(),
      phone:     body.phone.trim(),
      address:   body.address.trim(),
      city:      body.city.trim(),
      state:     body.state.trim(),
      pincode:   body.pincode.trim(),
      isDefault: existing === 0,
    },
  });
}

export async function getUserAddresses(userId: number) {
  return prisma.address.findMany({
    where:   { userId },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  });
}

export async function getAddressById(userId: number, id: number) {
  const addr = await prisma.address.findFirst({ where: { id, userId } });
  if (!addr) throw makeError('Address not found', 404);
  return addr;
}

export async function updateAddress(userId: number, id: number, body: UpdateAddressBody) {
  const existing = await prisma.address.findFirst({ where: { id, userId } });
  if (!existing) throw makeError('Address not found', 404);

  if (body.phone !== undefined && body.phone !== existing.phone) {
    if (!/^[+]?[\d\s\-() ]{10,15}$/.test(body.phone.replace(/[\s\-()]/g, ''))) {
      throw makeError('Enter a valid phone number (10–13 digits)', 400);
    }
  }
  if (body.pincode !== undefined && body.pincode !== existing.pincode) {
    if (!/^[1-9][0-9]{5}$/.test(body.pincode.trim())) {
      throw makeError('Enter a valid 6-digit pincode', 400);
    }
  }

  return prisma.address.update({
    where: { id },
    data: {
      ...(body.fullName !== undefined && { fullName: body.fullName.trim() }),
      ...(body.phone    !== undefined && { phone:    body.phone.trim() }),
      ...(body.address  !== undefined && { address:  body.address.trim() }),
      ...(body.city     !== undefined && { city:     body.city.trim() }),
      ...(body.state    !== undefined && { state:    body.state.trim() }),
      ...(body.pincode  !== undefined && { pincode:  body.pincode.trim() }),
    },
  });
}

export async function deleteAddress(userId: number, id: number) {
  const existing = await prisma.address.findFirst({ where: { id, userId } });
  if (!existing) throw makeError('Address not found', 404);

  await prisma.address.delete({ where: { id } });

  // If deleted address was default, promote the newest remaining
  if (existing.isDefault) {
    const next = await prisma.address.findFirst({
      where:   { userId },
      orderBy: { createdAt: 'desc' },
    });
    if (next) await prisma.address.update({ where: { id: next.id }, data: { isDefault: true } });
  }
}

export async function setDefaultAddress(userId: number, id: number) {
  const existing = await prisma.address.findFirst({ where: { id, userId } });
  if (!existing) throw makeError('Address not found', 404);

  await prisma.$transaction([
    prisma.address.updateMany({ where: { userId }, data: { isDefault: false } }),
    prisma.address.update({ where: { id }, data: { isDefault: true } }),
  ]);
}
