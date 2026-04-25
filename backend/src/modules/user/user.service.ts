import prisma from '../../common/lib/prisma';

function makeError(message: string, statusCode: number): Error {
  const err = new Error(message);
  (err as any).statusCode = statusCode;
  return err;
}

export async function getProfile(userId: number) {
  const user = await prisma.user.findUnique({
    where:  { id: userId },
    select: { id: true, name: true, phone: true, email: true, role: true, createdAt: true },
  });
  if (!user) throw makeError('User not found', 404);
  return user;
}

export async function updateProfile(userId: number, body: { name?: string; email?: string }) {
  const data: { name?: string; email?: string } = {};

  if (body.name !== undefined) {
    const trimmed = body.name.trim();
    if (!trimmed) throw makeError('Name cannot be empty', 400);
    data.name = trimmed;
  }

  if (body.email !== undefined) {
    const trimmed = body.email.trim();
    if (trimmed && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      throw makeError('Enter a valid email address', 400);
    }
    data.email = trimmed || undefined;
  }

  if (Object.keys(data).length === 0) throw makeError('Nothing to update', 400);

  return prisma.user.update({
    where:  { id: userId },
    data,
    select: { id: true, name: true, phone: true, email: true, role: true, createdAt: true },
  });
}
