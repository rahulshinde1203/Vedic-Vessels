import type { Product } from '@/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalize(p: any): Product {
  return {
    id:          p.id,
    name:        p.name,
    description: p.description ?? undefined,
    price:       Number(p.price),   // Prisma Decimal serialises as "1299.00" string
    stock:       p.stock,
    imageUrl:    p.imageUrl ?? null,
    isActive:    p.isActive,
    category:    p.category,
  };
}

export async function fetchProducts(params?: { category?: string }): Promise<Product[]> {
  const qs = new URLSearchParams();
  if (params?.category) qs.set('category', params.category);

  const base = process.env.NEXT_PUBLIC_API_URL;
  const url = `${base}/products${qs.toString() ? `?${qs}` : ''}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch products');

  const json = await res.json();
  return (json.data ?? []).map(normalize);
}
