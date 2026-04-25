import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  // ── Categories ───────────────────────────────────────────────────────────────

  const [pujaSet, copperBottle, brassVessel, diyaLamp] = await Promise.all([
    prisma.category.upsert({
      where:  { name: 'Puja Sets' },
      update: {},
      create: { name: 'Puja Sets' },
    }),
    prisma.category.upsert({
      where:  { name: 'Copper Bottles' },
      update: {},
      create: { name: 'Copper Bottles' },
    }),
    prisma.category.upsert({
      where:  { name: 'Brass Vessels' },
      update: {},
      create: { name: 'Brass Vessels' },
    }),
    prisma.category.upsert({
      where:  { name: 'Diyas & Lamps' },
      update: {},
      create: { name: 'Diyas & Lamps' },
    }),
  ]);

  console.log('✓ 4 categories ready');

  // ── Products ─────────────────────────────────────────────────────────────────

  const products = [
    // Puja Sets ──────────────────────────────────────────────────────────────
    {
      name:        'Brass Puja Thali Set',
      description: 'Complete brass puja thali with diya, bell, incense holder, and flower plate. Ideal for daily rituals and festivals.',
      price:       1299,
      stock:       45,
      imageUrl:    null,
      categoryId:  pujaSet.id,
    },
    {
      name:        'Copper Puja Kalash',
      description: 'Traditional copper kalash with lid and mango leaves design. Used for Griha Pravesh, Satyanarayan Puja, and Navratri.',
      price:       899,
      stock:       30,
      imageUrl:    null,
      categoryId:  pujaSet.id,
    },
    {
      name:        'Panch Patra with Spoon',
      description: 'Brass panch patra and achamani spoon for performing Hindu rituals. Holds tirtha (holy water) during puja.',
      price:       649,
      stock:       60,
      imageUrl:    null,
      categoryId:  pujaSet.id,
    },

    // Copper Bottles ─────────────────────────────────────────────────────────
    {
      name:        'Plain Copper Water Bottle 1L',
      description: 'Leak-proof pure copper bottle for Ayurvedic water storage. Storing water overnight balances the three doshas.',
      price:       599,
      stock:       80,
      imageUrl:    null,
      categoryId:  copperBottle.id,
    },
    {
      name:        'Embossed Copper Bottle 750ml',
      description: 'Hand-engraved copper bottle with traditional temple motifs. Antimicrobial and eco-friendly alternative to plastic.',
      price:       799,
      stock:       55,
      imageUrl:    null,
      categoryId:  copperBottle.id,
    },
    {
      name:        'Copper Tumbler Set of 2',
      description: 'Pure copper tumblers for daily water drinking. Each holds 300ml. Comes in a premium gift box.',
      price:       499,
      stock:       40,
      imageUrl:    null,
      categoryId:  copperBottle.id,
    },

    // Brass Vessels ──────────────────────────────────────────────────────────
    {
      name:        'Brass Lota 500ml',
      description: 'Traditional brass lota for carrying water during puja and pilgrimage. Smooth finish with a sturdy handle.',
      price:       749,
      stock:       35,
      imageUrl:    null,
      categoryId:  brassVessel.id,
    },
    {
      name:        'Brass Milk Pot with Lid',
      description: 'Heavy-gauge brass milk pot with tight-fitting lid. Suitable for heating milk directly on gas stoves.',
      price:       1199,
      stock:       20,
      imageUrl:    null,
      categoryId:  brassVessel.id,
    },

    // Diyas & Lamps ──────────────────────────────────────────────────────────
    {
      name:        'Terracotta Diya Set of 12',
      description: 'Handmade terracotta diyas with a wide mouth for extended oil burning. Perfect for Diwali and daily aarti.',
      price:       349,
      stock:       200,
      imageUrl:    null,
      categoryId:  diyaLamp.id,
    },
    {
      name:        'Brass Akhand Diya',
      description: 'Large brass oil lamp designed for continuous burning (akhand jyoti). Includes wick stand and snuffer tool.',
      price:       999,
      stock:       25,
      imageUrl:    null,
      categoryId:  diyaLamp.id,
    },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where:  { name_categoryId: { name: p.name, categoryId: p.categoryId } },
      update: { price: p.price, stock: p.stock, description: p.description },
      create: p,
    });
  }

  console.log(`✓ ${products.length} products ready`);
  console.log('\n✅ Seeding complete');
}

main()
  .catch((e) => {
    console.error('\n❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
