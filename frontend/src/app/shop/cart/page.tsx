'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Trash2, Plus, Minus, ShoppingBag, Tag,
  ChevronRight, Truck, Shield, RotateCcw, X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../lib/api';

/* ─── Constants ─────────────────────────────────────────── */
const SHIPPING_THRESHOLD = 999;
const SHIPPING_COST      = 99;
const TAX_RATE           = 0.18;

const VALID_COUPONS: Record<string, { type: 'pct' | 'flat'; value: number; label: string }> = {
  VEDIC10:  { type: 'pct',  value: 10,  label: '10% off your order' },
  FIRST100: { type: 'flat', value: 100, label: '₹100 off your order' },
  COPPER20: { type: 'pct',  value: 20,  label: '20% off copper vessels' },
};

/* ─── Skeleton ──────────────────────────────────────────── */
function CartSkeleton() {
  return (
    <div className="grid lg:grid-cols-3 gap-8 animate-pulse">
      <div className="lg:col-span-2 space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-brand-100 p-4 flex gap-4">
            <div className="w-24 h-24 skeleton rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-2.5 py-1">
              <div className="skeleton h-4 w-3/4 rounded-lg" />
              <div className="skeleton h-3 w-1/3 rounded-lg" />
              <div className="skeleton h-8 w-32 rounded-xl mt-3" />
            </div>
            <div className="skeleton h-5 w-16 rounded-lg self-start" />
          </div>
        ))}
      </div>
      <div className="skeleton rounded-2xl h-96" />
    </div>
  );
}

/* ─── Cart item ─────────────────────────────────────────── */
function CartItem({
  item,
  onUpdate,
  onRemove,
  updating,
}: {
  item: any;
  onUpdate: (qty: number) => void;
  onRemove: () => void;
  updating: boolean;
}) {
  const price    = Number(item.product.price);
  const compare  = item.product.comparePrice ? Number(item.product.comparePrice) : null;
  const lineTotal = price * item.quantity;

  return (
    <div className={`bg-white rounded-2xl border border-brand-100 p-4 md:p-5 flex gap-4 transition-opacity duration-200 ${updating ? 'opacity-60 pointer-events-none' : ''}`}>

      {/* Image */}
      <Link href={`/shop/products/${item.product.slug}`} className="relative w-20 h-20 md:w-24 md:h-24 flex-shrink-0 rounded-xl overflow-hidden bg-cream-200 border border-brand-100">
        {item.product.images?.[0] ? (
          <Image
            src={item.product.images[0]}
            alt={item.product.name}
            fill
            sizes="96px"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl bg-gradient-to-br from-brand-100 to-brand-200">
            🏺
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <Link
            href={`/shop/products/${item.product.slug}`}
            className="font-semibold text-brand-900 text-sm md:text-base leading-snug hover:text-brand-600 transition-colors line-clamp-2"
          >
            {item.product.name}
          </Link>
          <p className="text-2xs text-brand-400 mt-0.5">{item.product.category?.name}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm font-semibold text-brand-700">₹{price.toLocaleString('en-IN')}</span>
            {compare && (
              <span className="text-xs text-brand-300 line-through">₹{compare.toLocaleString('en-IN')}</span>
            )}
          </div>
        </div>

        {/* Quantity control */}
        <div className="flex items-center gap-3 mt-3">
          <div className="flex items-center border border-brand-200 rounded-xl overflow-hidden bg-brand-50">
            <button
              onClick={() => onUpdate(Math.max(1, item.quantity - 1))}
              disabled={item.quantity <= 1}
              className="px-2.5 py-1.5 hover:bg-brand-100 transition-colors text-brand-700 disabled:opacity-40"
            >
              <Minus size={13} />
            </button>
            <span className="px-3 py-1.5 text-sm font-bold text-brand-900 border-x border-brand-200 min-w-[2.5rem] text-center">
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdate(item.quantity + 1)}
              disabled={item.quantity >= item.product.stock}
              className="px-2.5 py-1.5 hover:bg-brand-100 transition-colors text-brand-700 disabled:opacity-40"
            >
              <Plus size={13} />
            </button>
          </div>
          <button
            onClick={onRemove}
            className="text-brand-300 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50"
            title="Remove item"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Line total */}
      <div className="flex-shrink-0 text-right">
        <p className="font-display font-bold text-brand-900 text-base md:text-lg">
          ₹{lineTotal.toLocaleString('en-IN')}
        </p>
        {item.quantity > 1 && (
          <p className="text-2xs text-brand-400 mt-0.5">
            {item.quantity} × ₹{price.toLocaleString('en-IN')}
          </p>
        )}
      </div>
    </div>
  );
}

/* ─── Main page ─────────────────────────────────────────── */
export default function CartPage() {
  const router      = useRouter();
  const queryClient = useQueryClient();

  const [couponInput, setCouponInput]   = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<typeof VALID_COUPONS[string] & { code: string } | null>(null);
  const [couponError, setCouponError]   = useState('');
  const [updatingId, setUpdatingId]     = useState<string | null>(null);

  /* ── Queries / mutations ── */
  const { data, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: () => api.get('/cart').then(r => r.data.data),
  });

  const updateItem = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      api.put(`/cart/items/${itemId}`, { quantity }),
    onMutate: ({ itemId }) => setUpdatingId(itemId),
    onSettled: () => setUpdatingId(null),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
    onError:   () => toast.error('Could not update quantity'),
  });

  const removeItem = useMutation({
    mutationFn: (itemId: string) => api.delete(`/cart/items/${itemId}`),
    onMutate: (itemId) => setUpdatingId(itemId),
    onSettled: () => setUpdatingId(null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Item removed from cart');
    },
    onError: () => toast.error('Could not remove item'),
  });

  const clearCart = useMutation({
    mutationFn: () => api.delete('/cart'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Cart cleared');
    },
  });

  /* ── Coupon logic ── */
  const applyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    const found = VALID_COUPONS[code];
    if (!found) {
      setCouponError('Invalid coupon code. Try VEDIC10 or FIRST100.');
      return;
    }
    setAppliedCoupon({ ...found, code });
    setCouponInput('');
    setCouponError('');
    toast.success(`Coupon "${code}" applied!`);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    toast.success('Coupon removed');
  };

  /* ── Calculations ── */
  const items    = data?.items ?? [];
  const subtotal = items.reduce((s: number, i: any) => s + Number(i.product.price) * i.quantity, 0);
  const shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const discount = appliedCoupon
    ? appliedCoupon.type === 'pct'
      ? Math.round(subtotal * appliedCoupon.value / 100)
      : appliedCoupon.value
    : 0;
  const taxable  = Math.max(0, subtotal - discount);
  const tax      = Math.round(taxable * TAX_RATE);
  const total    = taxable + shipping + tax;
  const totalItems = items.reduce((s: number, i: any) => s + i.quantity, 0);
  const shippingLeft = SHIPPING_THRESHOLD - subtotal;

  /* ── Render ── */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="h-9 skeleton rounded-xl w-40 mb-8" />
          <CartSkeleton />
        </div>
      </div>
    );
  }

  /* Empty state */
  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] bg-cream-100 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-24 h-24 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag size={40} className="text-brand-400" />
          </div>
          <h2 className="font-display text-2xl font-bold text-brand-900 mb-2">Your cart is empty</h2>
          <p className="text-brand-400 text-sm mb-8 leading-relaxed">
            Looks like you haven't added anything yet. Discover our handcrafted collection.
          </p>
          <Link href="/shop/products" className="btn-primary btn-lg inline-flex">
            Browse Products <ChevronRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-100">

      {/* ── Header ── */}
      <div className="bg-white border-b border-brand-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-brand-950">
              Shopping Cart
              <span className="ml-2 text-lg text-brand-400 font-normal">({totalItems} {totalItems === 1 ? 'item' : 'items'})</span>
            </h1>
          </div>
          <button
            onClick={() => clearCart.mutate()}
            disabled={clearCart.isPending}
            className="btn-ghost text-xs text-brand-400 hover:text-red-500 gap-1.5"
          >
            <X size={13} /> Clear cart
          </button>
        </div>
      </div>

      {/* ── Free shipping progress bar ── */}
      {shippingLeft > 0 && (
        <div className="bg-brand-700 text-white text-sm text-center py-2.5 px-4">
          Add <strong>₹{shippingLeft.toLocaleString('en-IN')}</strong> more to get free shipping 🚚
        </div>
      )}
      {shippingLeft <= 0 && (
        <div className="bg-green-600 text-white text-sm text-center py-2.5 px-4">
          🎉 You've unlocked free shipping!
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8 items-start">

          {/* ── Left: Cart items ── */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item: any) => (
              <CartItem
                key={item.id}
                item={item}
                updating={updatingId === item.id}
                onUpdate={(qty) => updateItem.mutate({ itemId: item.id, quantity: qty })}
                onRemove={() => removeItem.mutate(item.id)}
              />
            ))}

            {/* Continue shopping */}
            <div className="pt-2">
              <Link href="/shop/products" className="btn-ghost text-sm gap-2 text-brand-500">
                ← Continue Shopping
              </Link>
            </div>
          </div>

          {/* ── Right: Order summary ── */}
          <div className="lg:sticky lg:top-24 space-y-4">

            {/* Coupon */}
            <div className="bg-white rounded-2xl border border-brand-100 shadow-card p-5">
              <p className="text-sm font-semibold text-brand-900 mb-3 flex items-center gap-2">
                <Tag size={15} className="text-brand-500" /> Coupon Code
              </p>

              {appliedCoupon ? (
                <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-green-800">{appliedCoupon.code}</p>
                    <p className="text-xs text-green-600 mt-0.5">{appliedCoupon.label}</p>
                  </div>
                  <button onClick={removeCoupon} className="text-green-600 hover:text-green-800 p-1 rounded-lg hover:bg-green-100 transition-colors">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponError(''); }}
                      onKeyDown={e => e.key === 'Enter' && applyCoupon()}
                      placeholder="Enter code (e.g. VEDIC10)"
                      className="input text-sm py-2 flex-1 uppercase tracking-wider placeholder:normal-case placeholder:tracking-normal"
                    />
                    <button
                      onClick={applyCoupon}
                      disabled={!couponInput.trim()}
                      className="btn-secondary btn-sm flex-shrink-0 disabled:opacity-50"
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-xs text-red-500 mt-2">{couponError}</p>
                  )}
                </>
              )}
            </div>

            {/* Price breakdown */}
            <div className="bg-white rounded-2xl border border-brand-100 shadow-card p-5">
              <h2 className="font-display font-bold text-brand-900 text-lg mb-5">Order Summary</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-brand-700">
                  <span>Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'items'})</span>
                  <span className="font-medium">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-green-700">
                    <span className="flex items-center gap-1.5">
                      <Tag size={12} /> Coupon ({appliedCoupon.code})
                    </span>
                    <span className="font-semibold">−₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex justify-between text-brand-700">
                  <span className="flex items-center gap-1.5">
                    <Truck size={13} className="text-brand-400" /> Shipping
                  </span>
                  {shipping === 0 ? (
                    <span className="text-green-600 font-semibold">Free</span>
                  ) : (
                    <span className="font-medium">₹{shipping}</span>
                  )}
                </div>

                <div className="flex justify-between text-brand-700">
                  <span>GST (18%)</span>
                  <span className="font-medium">₹{tax.toLocaleString('en-IN')}</span>
                </div>

                <div className="border-t border-brand-100 pt-3 mt-1">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-brand-950 text-base">Total</span>
                    <span className="font-display font-bold text-brand-950 text-2xl">
                      ₹{total.toLocaleString('en-IN')}
                    </span>
                  </div>
                  {appliedCoupon && (
                    <p className="text-xs text-green-600 font-semibold text-right mt-1">
                      You save ₹{(discount + (subtotal >= SHIPPING_THRESHOLD ? SHIPPING_COST : 0)).toLocaleString('en-IN')} on this order
                    </p>
                  )}
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                onClick={() => router.push('/shop/checkout')}
                className="btn-copper w-full justify-center py-4 text-base rounded-2xl mt-5 shadow-md hover:shadow-lg"
              >
                Proceed to Checkout <ChevronRight size={18} />
              </button>

              <p className="text-center text-2xs text-brand-400 mt-3">
                Secure checkout · 256-bit SSL encryption
              </p>

              {/* Trust row */}
              <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-brand-100">
                {[
                  { icon: Shield,    label: 'Secure Pay' },
                  { icon: Truck,     label: 'Fast Ship' },
                  { icon: RotateCcw, label: '7-Day Return' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex flex-col items-center gap-1 text-center">
                    <Icon size={15} className="text-brand-400" />
                    <span className="text-[10px] text-brand-400 font-medium">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Accepted payments note */}
            <p className="text-center text-2xs text-brand-400">
              We accept UPI · Debit / Credit Cards · Net Banking · Wallets
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
