import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Admin user
  const adminPassword = await bcrypt.hash('Admin@123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@vedicvessels.com' },
    update: {},
    create: { email: 'admin@vedicvessels.com', password: adminPassword, name: 'Admin', role: 'ADMIN' },
  });

  // Test user
  const userPassword = await bcrypt.hash('User@123', 12);
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: { email: 'user@example.com', password: userPassword, name: 'Test User', role: 'USER' },
  });
  await prisma.cart.upsert({ where: { userId: user.id }, update: {}, create: { userId: user.id } });

  // Categories
  const categories = await Promise.all([
    prisma.category.upsert({ where: { slug: 'clay-pots' }, update: {}, create: { name: 'Clay Pots', slug: 'clay-pots', description: 'Traditional earthen clay pots' } }),
    prisma.category.upsert({ where: { slug: 'brass-items' }, update: {}, create: { name: 'Brass Items', slug: 'brass-items', description: 'Pure brass ritual items' } }),
    prisma.category.upsert({ where: { slug: 'copper-vessels' }, update: {}, create: { name: 'Copper Vessels', slug: 'copper-vessels', description: 'Handcrafted copper vessels' } }),
    prisma.category.upsert({ where: { slug: 'incense-diyas' }, update: {}, create: { name: 'Incense & Diyas', slug: 'incense-diyas', description: 'Aromatic incense and oil lamps' } }),
  ]);

  // Products
  const products = [
    { name: 'Terracotta Water Pot', slug: 'terracotta-water-pot', description: 'Traditional hand-thrown terracotta water pot, keeps water naturally cool', price: 349, stock: 50, sku: 'CP-001', categoryId: categories[0].id, isFeatured: true },
    { name: 'Brass Kalash', slug: 'brass-kalash', description: 'Pure brass kalash for puja and rituals, 500ml capacity', price: 799, stock: 30, sku: 'BR-001', categoryId: categories[1].id, isFeatured: true },
    { name: 'Copper Lota', slug: 'copper-lota', description: 'Handcrafted pure copper lota, 200ml, ideal for daily use', price: 599, stock: 40, sku: 'CV-001', categoryId: categories[2].id },
    { name: 'Sandalwood Incense Sticks', slug: 'sandalwood-incense-sticks', description: 'Premium sandalwood incense sticks, 50 sticks per pack', price: 149, stock: 100, sku: 'ID-001', categoryId: categories[3].id, isFeatured: true },
    { name: 'Clay Diya Set (12 pcs)', slug: 'clay-diya-set', description: 'Hand-shaped clay oil lamps, pack of 12', price: 199, stock: 80, sku: 'ID-002', categoryId: categories[3].id },
    { name: 'Brass Puja Thali', slug: 'brass-puja-thali', description: 'Decorative brass puja thali with engraved motifs, 30cm diameter', price: 1299, stock: 20, sku: 'BR-002', categoryId: categories[1].id, isFeatured: true },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: { ...p, images: [] },
    });
  }

  console.log('Seed completed successfully');
  console.log('Admin: admin@vedicvessels.com / Admin@123');
  console.log('User:  user@example.com / User@123');
}

main().catch(console.error).finally(() => prisma.$disconnect());
