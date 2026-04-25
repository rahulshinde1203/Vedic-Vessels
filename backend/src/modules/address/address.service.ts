import prisma from '../../common/lib/prisma';
import type { CreateAddressBody } from './address.types';

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
  return prisma.address.create({
    data: {
      userId,
      fullName: body.fullName.trim(),
      phone:    body.phone.trim(),
      address:  body.address.trim(),
      city:     body.city.trim(),
      state:    body.state.trim(),
      pincode:  body.pincode.trim(),
    },
  });
}

export async function getUserAddresses(userId: number) {
  return prisma.address.findMany({
    where:   { userId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getAddressById(userId: number, id: number) {
  const addr = await prisma.address.findFirst({ where: { id, userId } });
  if (!addr) throw makeError('Address not found', 404);
  return addr;
}
