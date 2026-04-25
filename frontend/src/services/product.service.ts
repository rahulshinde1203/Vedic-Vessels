import type { Product } from '@/types';

const BASE = process.env.NEXT_PUBLIC_API_URL;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalize(p: any): Product {
  return {
    id:              p.id,
    name:            p.name,
    description:     p.description ?? undefined,
    price:           Number(p.price),
    mrp:             p.mrp    ? Number(p.mrp)             : undefined,
    discountPercent: p.discountPercent ? Number(p.discountPercent) : undefined,
    images:          Array.isArray(p.images) ? p.images as string[] : [],
    stock:           p.stock,
    imageUrl:        p.imageUrl ?? null,
    isActive:        p.isActive,
    category:        p.category,
  };
}

export async function fetchProducts(params?: { category?: string }): Promise<Product[]> {
  const qs = new URLSearchParams();
  if (params?.category) qs.set('category', params.category);

  const url = `${BASE}/products${qs.toString() ? `?${qs}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch products');

  const json = await res.json();
  return (json.data ?? []).map(normalize);
}

export async function fetchProductById(id: number): Promise<Product> {
  const res = await fetch(`${BASE}/products/${id}`, { next: { revalidate: 60 } });
  if (!res.ok) {
    const err = new Error('Product not found');
    (err as any).statusCode = res.status;
    throw err;
  }
  const json = await res.json();
  return normalize(json.data);
}
