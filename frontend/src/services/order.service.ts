import type { CartItem } from '@/types';
import { useAuthStore } from '@/store/auth.store';

export interface OrderResult {
  id:     number;
  status: string;
}

export async function createOrder(cartItems: CartItem[]): Promise<OrderResult> {
  const items = cartItems.map((i) => ({
    productId: i.id,
    quantity:  i.quantity,
    price:     i.price,
  }));
  const totalAmount = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const token   = useAuthStore.getState().token;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
    method: 'POST',
    headers,
    body:   JSON.stringify({ items, totalAmount }),
  });

  const json = await res.json();
  if (process.env.NODE_ENV === 'development') {
    console.log('[order] response', res.status, json);
  }
  if (!res.ok) {
    const err = new Error(json.message ?? 'Failed to place order');
    (err as any).status = res.status;
    throw err;
  }
  return json.data as OrderResult;
}
