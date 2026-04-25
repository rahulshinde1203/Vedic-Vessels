'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useCartStore } from '@/store/cart.store';
import type { Product } from '@/types';

interface Props {
  product: Product;
}

export default function ProductActions({ product }: Props) {
  const router   = useRouter();
  const addToCart = useCartStore((s) => s.addToCart);
  const cartQty   = useCartStore((s) => s.items.find((i) => i.id === product.id)?.quantity ?? 0);
  const [adding, setAdding] = useState(false);

  const inStock = product.isActive && product.stock > 0;
  const atMax   = cartQty >= product.stock;

  function handleAddToCart() {
    if (!inStock) return;
    if (atMax) {
      toast.error('Maximum stock reached');
      return;
    }
    addToCart(product);
    setAdding(true);
    toast.success('Added to cart!');
    setTimeout(() => setAdding(false), 1500);
  }

  function handleBuyNow() {
    if (!inStock) return;
    if (cartQty === 0) addToCart(product);
    router.push('/cart');
  }

  if (!inStock) {
    return (
      <button
        disabled
        className="w-full py-3.5 rounded-xl text-sm font-semibold text-gray-400 bg-gray-100 cursor-not-allowed border border-gray-200"
      >
        Out of Stock
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-3">

      {/* Add to Cart */}
      <button
        onClick={handleAddToCart}
        className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all duration-150 shadow-sm active:scale-[0.98] border ${
          adding
            ? 'bg-green-500 text-white border-green-500'
            : atMax
            ? 'bg-orange-50 text-orange-600 border-orange-300 cursor-not-allowed'
            : 'bg-white text-brand-charcoal border-brand-gold hover:bg-brand-gold/10 hover:shadow-md'
        }`}
      >
        {adding ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            Added to Cart
          </span>
        ) : atMax ? (
          'Max Quantity Reached'
        ) : (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Add to Cart
          </span>
        )}
      </button>

      {/* Buy Now */}
      <button
        onClick={handleBuyNow}
        className="w-full py-3.5 rounded-xl text-sm font-bold text-brand-charcoal bg-linear-to-r from-brand-gold to-brand-amber hover:from-brand-gold-dark hover:to-brand-gold transition-all duration-150 shadow-sm hover:shadow-md active:scale-[0.98]"
      >
        Buy Now
      </button>

    </div>
  );
}
