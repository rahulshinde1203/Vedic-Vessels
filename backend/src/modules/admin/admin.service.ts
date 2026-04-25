import prisma from '../../common/lib/prisma';
import { uploadBuffer } from '../../common/lib/cloudinary';
import type {
  CreateProductBody,
  UpdateProductBody,
  CreateCategoryBody,
  AdminOrderStatus,
} from './admin.types';

function makeError(message: string, statusCode: number): Error {
  const err = new Error(message);
  (err as any).statusCode = statusCode;
  return err;
}

function toImages(val: unknown): string[] {
  return Array.isArray(val) ? (val as string[]) : [];
}

// ── Dashboard ──────────────────────────────────────────────────────────────────

export async function getStats() {
  const [
    totalOrders,
    totalProducts,
    totalUsers,
    pendingOrders,
    lowStockProducts,
    revenueResult,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.user.count(),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.product.count({ where: { isActive: true, stock: { lte: 5 } } }),
    prisma.order.aggregate({ _sum: { totalAmount: true } }),
  ]);

  const totalRevenue = Number(revenueResult._sum.totalAmount ?? 0);
  return { totalOrders, totalRevenue, totalProducts, totalUsers, pendingOrders, lowStockProducts };
}

// ── Products ───────────────────────────────────────────────────────────────────

export async function getAdminProducts() {
  const products = await prisma.product.findMany({
    include: { category: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return products.map((p) => ({ ...p, images: toImages(p.images) }));
}

export async function createProduct(
  body:  CreateProductBody,
  files: Express.Multer.File[],
) {
  if (!body.name?.trim())              throw makeError('Product name is required', 400);
  if (!files || files.length === 0)    throw makeError('At least one image is required', 400);
  if (files.length > 5)                throw makeError('Maximum 5 images allowed', 400);

  const mrp        = parseFloat(String(body.mrp));
  const price      = parseFloat(String(body.price));
  const stock      = parseInt(String(body.stock), 10);
  const categoryId = parseInt(String(body.categoryId), 10);

  if (isNaN(mrp)   || mrp < 0)    throw makeError('Invalid MRP', 400);
  if (isNaN(price) || price < 0)  throw makeError('Invalid selling price', 400);
  if (price > mrp)                 throw makeError('Selling price cannot exceed MRP', 400);
  if (isNaN(stock) || stock < 0)  throw makeError('Invalid stock quantity', 400);
  if (!Number.isInteger(categoryId)) throw makeError('Invalid category', 400);

  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) throw makeError('Category not found', 404);

  const discountPercent =
    mrp > 0 ? Math.round(((mrp - price) / mrp) * 10000) / 100 : 0;

  // Step 1: Create product without images
  const product = await prisma.product.create({
    data: {
      name:           body.name.trim(),
      description:    body.description?.trim() || null,
      mrp,
      price,
      discountPercent,
      stock,
      categoryId,
      images:         [],
    },
  });

  try {
    // Step 2: Upload to Cloudinary
    const folder    = `vedic-vessels/products/${product.id}`;
    const imageUrls = await Promise.all(
      files.map((file, i) =>
        uploadBuffer(
          file.buffer,
          folder,
          `product_${product.id}_${i}`,
        ).then((r) => r.secure_url),
      ),
    );

    // Step 3: Update product with image URLs
    const updated = await prisma.product.update({
      where:   { id: product.id },
      data:    { images: imageUrls, imageUrl: imageUrls[0] },
      include: { category: { select: { id: true, name: true } } },
    });

    console.log(`[Admin] Product #${product.id} created — ${imageUrls.length} image(s)`);
    return { ...updated, images: toImages(updated.images) };

  } catch (err) {
    // Rollback: remove the stub product if image upload fails
    await prisma.product.delete({ where: { id: product.id } }).catch(() => {});
    throw makeError('Image upload failed. Please try again.', 500);
  }
}

export async function updateProduct(
  id:    number,
  body:  UpdateProductBody,
  files?: Express.Multer.File[],
) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw makeError('Product not found', 404);

  const mrp    = body.mrp    !== undefined ? parseFloat(String(body.mrp))    : undefined;
  const price  = body.price  !== undefined ? parseFloat(String(body.price))  : undefined;
  const stock  = body.stock  !== undefined ? parseInt(String(body.stock), 10) : undefined;
  const catId  = body.categoryId !== undefined
    ? parseInt(String(body.categoryId), 10)
    : undefined;
  const active = body.isActive !== undefined
    ? (String(body.isActive) === 'true' || body.isActive === true)
    : undefined;

  if (mrp   !== undefined && (isNaN(mrp)   || mrp < 0))   throw makeError('Invalid MRP', 400);
  if (price !== undefined && (isNaN(price) || price < 0)) throw makeError('Invalid price', 400);
  if (mrp !== undefined && price !== undefined && price > mrp) {
    throw makeError('Selling price cannot exceed MRP', 400);
  }
  if (stock !== undefined && (isNaN(stock) || stock < 0)) throw makeError('Invalid stock', 400);
  if (catId !== undefined) {
    const cat = await prisma.category.findUnique({ where: { id: catId } });
    if (!cat) throw makeError('Category not found', 404);
  }

  const effectiveMrp   = mrp   ?? Number(product.mrp);
  const effectivePrice = price ?? Number(product.price);
  const discountPercent = effectiveMrp > 0
    ? Math.round(((effectiveMrp - effectivePrice) / effectiveMrp) * 10000) / 100
    : 0;

  let imageUpdates: Record<string, unknown> = {};
  if (files && files.length > 0) {
    if (files.length > 5) throw makeError('Maximum 5 images allowed', 400);
    const folder    = `vedic-vessels/products/${id}`;
    const imageUrls = await Promise.all(
      files.map((file, i) =>
        uploadBuffer(file.buffer, folder, `product_${id}_${i}`).then((r) => r.secure_url),
      ),
    );
    imageUpdates = { images: imageUrls, imageUrl: imageUrls[0] };
  }

  const updated = await prisma.product.update({
    where: { id },
    data:  {
      ...(body.name        !== undefined && { name:        body.name.trim() }),
      ...(body.description !== undefined && { description: body.description }),
      ...(mrp   !== undefined && { mrp }),
      ...(price !== undefined && { price }),
      ...(mrp !== undefined || price !== undefined ? { discountPercent } : {}),
      ...(stock !== undefined && { stock }),
      ...(catId !== undefined && { categoryId: catId }),
      ...(active !== undefined && { isActive: active }),
      ...imageUpdates,
    },
    include: { category: { select: { id: true, name: true } } },
  });

  return { ...updated, images: toImages(updated.images) };
}

export async function softDeleteProduct(id: number) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw makeError('Product not found', 404);
  await prisma.product.update({ where: { id }, data: { isActive: false } });
}

// ── Categories ─────────────────────────────────────────────────────────────────

export async function getAdminCategories() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { products: { where: { isActive: true } } } } },
  });
  return categories.map((c) => ({
    id:           c.id,
    name:         c.name,
    isActive:     c.isActive,
    productCount: c._count.products,
    createdAt:    c.createdAt,
  }));
}

export async function createCategory(body: CreateCategoryBody) {
  const name = body.name?.trim();
  if (!name) throw makeError('Category name is required', 400);

  const existing = await prisma.category.findFirst({ where: { name: { equals: name } } });
  if (existing) throw makeError('Category already exists', 409);

  return prisma.category.create({ data: { name } });
}

// ── Orders ─────────────────────────────────────────────────────────────────────

export async function getAdminOrders() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user:   { select: { id: true, phone: true, name: true } },
      _count: { select: { orderItems: true } },
    },
  });
  return orders.map((o) => ({
    id:          o.id,
    user:        o.user,
    totalAmount: Number(o.totalAmount),
    status:      o.status,
    itemCount:   o._count.orderItems,
    createdAt:   o.createdAt,
  }));
}

export async function getAdminOrderById(id: number) {
  const order = await prisma.order.findUnique({
    where:   { id },
    include: {
      user:       { select: { id: true, phone: true, name: true } },
      orderItems: {
        include: { product: { select: { id: true, name: true, imageUrl: true } } },
      },
    },
  });
  if (!order) throw makeError('Order not found', 404);
  return order;
}

export async function updateOrderStatus(id: number, status: AdminOrderStatus) {
  const VALID: AdminOrderStatus[] = ['PENDING', 'SHIPPED', 'DELIVERED'];
  if (!VALID.includes(status)) throw makeError('Invalid status', 400);

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) throw makeError('Order not found', 404);

  return prisma.order.update({ where: { id }, data: { status } });
}

// ── Users ──────────────────────────────────────────────────────────────────────

export async function getAdminUsers() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { orders: true } } },
  });
  return users.map((u) => ({
    id:         u.id,
    phone:      u.phone,
    name:       u.name,
    role:       u.role,
    orderCount: u._count.orders,
    createdAt:  u.createdAt,
  }));
}
