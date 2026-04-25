import type { CartItem } from '@/types';
import { useAuthStore } from '@/store/auth.store';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function authHeaders(): Record<string, string> {
  const token = useAuthStore.getState().token;
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface RazorpayOrderResult {
  orderId: string;
  amount:  number;
  keyId:   string;
}

// ── API calls ─────────────────────────────────────────────────────────────────

export async function createRazorpayOrder(
  amountInPaise: number,
): Promise<RazorpayOrderResult> {
  const res  = await fetch(`${API_URL}/payment/create-order`, {
    method:  'POST',
    headers: authHeaders(),
    body:    JSON.stringify({ amountInPaise }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message ?? 'Failed to create payment order');
  return json.data as RazorpayOrderResult;
}

export async function verifyPayment(params: {
  razorpay_order_id:   string;
  razorpay_payment_id: string;
  razorpay_signature:  string;
  cartItems:           CartItem[];
  totalAmount:         number;
  addressId:           number;
}): Promise<{ orderId: number }> {
  const { cartItems, ...rest } = params;
  const items = cartItems.map((i) => ({
    productId: i.id,
    quantity:  i.quantity,
    price:     i.price,
  }));
  const res  = await fetch(`${API_URL}/payment/verify`, {
    method:  'POST',
    headers: authHeaders(),
    body:    JSON.stringify({ ...rest, items }),
  });
  const json = await res.json();
  if (!res.ok) {
    const err = new Error(json.message ?? 'Payment verification failed');
    (err as any).status = res.status;
    throw err;
  }
  return json.data as { orderId: number };
}

// ── Script loader ─────────────────────────────────────────────────────────────

export function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window.Razorpay !== 'undefined') { resolve(); return; }
    const script   = document.createElement('script');
    script.src     = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload  = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay checkout'));
    document.body.appendChild(script);
  });
}
