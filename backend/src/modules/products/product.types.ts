import { Prisma } from '@prisma/client';

export type ProductWithCategory = Prisma.ProductGetPayload<{
  include: {
    category: { select: { id: true; name: true } };
  };
}>;

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string;
}
