'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  useCartStore,
  selectCartTotal,
  selectCartCount,
  selectIsCartValid,
} from '@/store/cart.store';
import { formatPrice } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import type { CartItem } from '@/types';

// ── Cart Item Row ─────────────────────────────────────────────────────────────

function CartItemRow({
  item,
  onIncrease,
  onDecrease,
  onRemove,
}: {
  item: CartItem;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove:   () => void;
}) {
  const atMax        = item.quantity >= item.stock;
  const isInactive   = !item.isActive;
  const isOOS        = item.stock === 0;
  const qtyExceeds   = item.stock > 0 && item.quantity > item.stock;
  const isInvalid    = isInactive || isOOS;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4 items-start">

      {/* Thumbnail */}
      <div className="w-20 h-20 shrink-0 rounded-lg bg-amber-50 flex items-center justify-center overflow-hidden border border-gray-100">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-3xl opacity-50 select-none">🏺</span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">

        {/* Status warnings */}
        {isInactive && (
          <p className="text-[10px] font-semibold text-red-500 mb-1">
            ⚠ Product no longer available — please remove it to continue
          </p>
        )}
        {!isInactive && isOOS && (
          <p className="text-[10px] font-semibold text-red-500 mb-1">
            ⚠ Out of stock — please remove it to continue
          </p>
        )}
        {qtyExceeds && (
          <p className="text-[10px] font-semibold text-orange-500 mb-1">
            ⚠ Only {item.stock} left — reduce quantity to continue
          </p>
        )}

        <p className={`text-sm font-semibold leading-snug ${isInvalid ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
          {item.name}
        </p>
        <p className="mt-0.5 text-sm font-bold text-gray-900">{formatPrice(item.price)}</p>

        {/* Quantity controls — hidden for invalid items */}
        {!isInvalid && (
          <div className="mt-3 flex items-center gap-3">
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={onDecrease}
                aria-label="Decrease quantity"
                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors font-bold text-base"
              >
                −
              </button>
              <span className="w-9 h-8 flex items-center justify-center text-sm font-semibold text-gray-800 border-x border-gray-300">
                {item.quantity}
              </span>
              <button
                onClick={onIncrease}
                disabled={atMax}
                aria-label="Increase quantity"
                className={`w-8 h-8 flex items-center justify-center font-bold text-base transition-colors ${
                  atMax ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                +
              </button>
            </div>

            <button
              onClick={onRemove}
              className="text-xs text-red-400 hover:text-red-600 font-medium transition-colors"
            >
              Remove
            </button>

            {/* Max stock hint */}
            {atMax && (
              <p className="text-[10px] font-semibold text-orange-500">
                Max stock
              </p>
            )}
          </div>
        )}

        {/* Remove link for invalid items (controls hidden) */}
        {isInvalid && (
          <button
            onClick={onRemove}
            className="mt-2 text-xs text-red-400 hover:text-red-600 font-medium transition-colors"
          >
            Remove
          </button>
        )}
      </div>

      {/* Line total */}
      <p className={`shrink-0 text-sm font-bold pt-0.5 ${isInvalid ? 'text-gray-300' : 'text-gray-900'}`}>
        {formatPrice(item.price * item.quantity)}
      </p>

    </div>
  );
}

// ── Cart Page ─────────────────────────────────────────────────────────────────

export default function CartPage() {
  const router = useRouter();
  const { items, removeFromCart, increaseQty, decreaseQty, clearCart } = useCartStore();
  const subtotal    = useCartStore(selectCartTotal);
  const totalItems  = useCartStore(selectCartCount);
  const cartValid   = useCartStore(selectIsCartValid);

  // Prevent flashing the empty state while Zustand rehydrates from localStorage
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const handleRemove = (item: CartItem) => {
    removeFromCart(item.id);
    toast.success(`Removed from cart`);
  };

  const handleCheckout = () => {
    if (!cartValid) return;
    if (!useAuthStore.getState().token) {
      router.push('/login?redirect=/checkout');
      return;
    }
    router.push('/checkout');
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-sm text-gray-400">Loading cart…</p>
      </div>
    );
  }

  // ── Empty state ─────────────────────────────────────────────────────────────

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center text-center px-4">
        <span className="text-7xl mb-4 select-none">🛒</span>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
        <p className="text-sm text-gray-500 mb-6">
          Add some sacred items and they will appear here.
        </p>
        <Link
          href="/shop"
          className="px-8 py-3 rounded-full bg-brand-gold text-brand-charcoal text-sm font-bold hover:bg-brand-gold-dark active:scale-[0.98] transition-all duration-150 shadow-sm"
        >
          Browse Shop
        </Link>
      </div>
    );
  }

  // ── Filled cart ─────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Shopping Cart
            <span className="ml-2 text-base font-normal text-gray-400">
              ({totalItems} {totalItems === 1 ? 'item' : 'items'})
            </span>
          </h1>
          <button
            onClick={clearCart}
            className="text-xs text-red-400 hover:text-red-600 font-semibold transition-colors"
          >
            Clear cart
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── Items list ── */}
          <div className="flex-1 space-y-3">
            {items.map((item) => (
              <CartItemRow
                key={item.id}
                item={item}
                onIncrease={() => increaseQty(item.id)}
                onDecrease={() => decreaseQty(item.id)}
                onRemove={() => handleRemove(item)}
              />
            ))}
          </div>

          {/* ── Order summary ── */}
          <div className="lg:w-72 shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-24">
              <h2 className="text-base font-bold text-gray-900 mb-4">Order Summary</h2>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'items'})</span>
                  <span className="font-medium text-gray-800">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>
                  <span className="font-semibold text-green-600">FREE</span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-base">
                  <span className="text-gray-900">Total</span>
                  <span className="text-brand-gold">{formatPrice(subtotal)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={!cartValid}
                className={`mt-5 w-full py-3 rounded-lg text-sm font-bold transition-all duration-150 shadow-sm ${
                  cartValid
                    ? 'text-brand-charcoal bg-brand-gold hover:bg-brand-gold-dark hover:shadow-md active:scale-[0.98]'
                    : 'text-gray-400 bg-gray-100 cursor-not-allowed'
                }`}
              >
                Proceed to Checkout
              </button>

              {!cartValid && (
                <p className="mt-2 text-[11px] text-red-500 text-center">
                  Remove unavailable items to continue
                </p>
              )}

              <Link
                href="/shop"
                className="mt-3 block text-center text-xs text-gray-400 hover:text-brand-gold transition-colors"
              >
                ← Continue Shopping
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
