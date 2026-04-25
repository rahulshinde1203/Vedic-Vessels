import prisma from '../../common/lib/prisma';
import type { CreateOrderBody } from './order.types';

function makeError(message: string, statusCode: number): Error {
  const err = new Error(message);
  (err as any).statusCode = statusCode;
  return err;
}

function formatAddressSnapshot(addr: {
  fullName: string; phone: string; address: string;
  city: string; state: string; pincode: string;
}): string {
  return `${addr.fullName}\n${addr.phone}\n${addr.address}\n${addr.city}, ${addr.state} - ${addr.pincode}`;
}

export async function createOrder(userId: number, body: CreateOrderBody) {
  const { items, totalAmount, addressId } = body;

  // ── Shape validation ────────────────────────────────────────────────────────
  if (!Array.isArray(items) || items.length === 0) {
    throw makeError('Order must have at least one item', 400);
  }
  if (typeof totalAmount !== 'number' || totalAmount <= 0) {
    throw makeError('Invalid total amount', 400);
  }
  if (!Number.isInteger(addressId) || addressId <= 0) {
    throw makeError('A delivery address is required', 400);
  }
  for (const item of items) {
    if (!Number.isInteger(item.productId) || item.productId <= 0) {
      throw makeError(`Invalid productId: ${item.productId}`, 400);
    }
    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      throw makeError(`Invalid quantity for product ${item.productId}`, 400);
    }
    if (typeof item.price !== 'number' || item.price <= 0) {
      throw makeError(`Invalid price for product ${item.productId}`, 400);
    }
  }

  const computedTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  if (Math.abs(computedTotal - totalAmount) > 1) {
    throw makeError('Total amount mismatch', 400);
  }

  // ── Atomic transaction ──────────────────────────────────────────────────────
  const order = await prisma.$transaction(async (tx) => {

    // 1. Verify address belongs to this user
    const address = await tx.address.findFirst({ where: { id: addressId, userId } });
    if (!address) throw makeError('Delivery address not found', 404);

    // 2. Re-validate each product
    for (const item of items) {
      const product = await tx.product.findUnique({ where: { id: item.productId } });
      if (!product)        throw makeError(`Product ${item.productId} not found`, 404);
      if (!product.isActive) throw makeError(`"${product.name}" is no longer available`, 400);
      if (product.stock < item.quantity) {
        throw makeError(`"${product.name}" is out of stock. Please update your cart.`, 409);
      }
    }

    // 3. Create order with address snapshot
    const newOrder = await tx.order.create({
      data: {
        userId,
        addressId:       address.id,
        deliveryAddress: formatAddressSnapshot(address),
        totalAmount:     computedTotal,
        orderItems: {
          create: items.map((i) => ({
            productId: i.productId,
            quantity:  i.quantity,
            price:     i.price,
          })),
        },
      },
      include: {
        orderItems: { include: { product: { select: { name: true } } } },
      },
    });

    // 4. Decrement stock atomically
    for (const item of items) {
      const { count } = await tx.product.updateMany({
        where: { id: item.productId, stock: { gte: item.quantity } },
        data:  { stock: { decrement: item.quantity } },
      });
      if (count === 0) {
        throw makeError('Some items went out of stock. Please update your cart.', 409);
      }
    }

    return newOrder;
  });

  return order;
}
