'use client';

import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import type { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store/cart.store';

// ── Star Rating ───────────────────────────────────────────────────────────────

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-px">
        {Array.from({ length: 5 }, (_, i) => {
          const filled = i < Math.floor(rating);
          const half   = !filled && i === Math.floor(rating) && rating % 1 >= 0.5;
          return (
            <svg
              key={i}
              className={`w-3.5 h-3.5 ${filled || half ? 'text-amber-400' : 'text-gray-300'}`}
              fill={filled ? 'currentColor' : half ? 'url(#half)' : 'none'}
              stroke="currentColor"
              strokeWidth={filled || half ? 0 : 1.5}
              viewBox="0 0 24 24"
            >
              {half && (
                <defs>
                  <linearGradient id="half">
                    <stop offset="50%" stopColor="currentColor" />
                    <stop offset="50%" stopColor="transparent" />
                  </linearGradient>
                </defs>
              )}
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              />
            </svg>
          );
        })}
      </div>
      <span className="text-xs font-semibold text-gray-700">{rating.toFixed(1)}</span>
      <span className="text-xs text-gray-400">({count.toLocaleString()})</span>
    </div>
  );
}

// ── Placeholder icon map ───────────────────────────────────────────────────────

const ICON: Record<string, string> = {
  'Diyas & Lamps':  '🪔',
  'Brass Vessels':  '🏺',
  'Puja Sets':      '🙏',
  'Copper Bottles': '🍶',
};

// ── ProductCard ───────────────────────────────────────────────────────────────

type ButtonState = 'idle' | 'added' | 'maxStock';

export default function ProductCard({ product }: { product: Product }) {
  const addToCart    = useCartStore((state) => state.addToCart);
  const cartQty      = useCartStore((state) => state.items.find((i) => i.id === product.id)?.quantity ?? 0);
  const [btnState, setBtnState] = useState<ButtonState>('idle');

  const inStock       = product.isActive && product.stock > 0;
  const isAtMaxStock  = cartQty >= product.stock;
  const isPopular     = inStock && (product.reviewCount ?? 0) >= 200;
  const isLimitedDeal = (product.discount ?? 0) >= 25;

  const handleAddToCart = () => {
    if (isAtMaxStock) {
      setBtnState('maxStock');
      toast.error('Maximum stock reached');
      setTimeout(() => setBtnState('idle'), 1500);
      return;
    }
    addToCart(product);
    setBtnState('added');
    toast.success('Added to cart');
    setTimeout(() => setBtnState('idle'), 1500);
  };

  return (
    <div className="group flex flex-col bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 overflow-hidden">

      {/* ── Image area ── */}
      <Link href={`/product/${product.id}`} className="relative aspect-3/4 bg-gray-50 overflow-hidden block">

        {/* Discount badge */}
        {product.discount && (
          <span className="absolute top-2.5 left-2.5 z-10 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full leading-tight shadow-sm">
            {product.discount}% OFF
          </span>
        )}

        {/* Out of stock overlay */}
        {!inStock && (
          <div className="absolute inset-0 z-10 bg-white/80 flex items-center justify-center">
            <span className="text-xs font-semibold text-gray-500 bg-white border border-gray-300 px-3 py-1 rounded-full">
              Out of Stock
            </span>
          </div>
        )}

        {/* Product image or emoji placeholder */}
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-amber-50">
            <span className="text-6xl opacity-50 group-hover:opacity-70 group-hover:scale-110 transition-all duration-300 select-none">
              {ICON[product.category.name] ?? '🏺'}
            </span>
          </div>
        )}

        {/* Limited Deal ribbon */}
        {isLimitedDeal && inStock && (
          <div className="absolute bottom-0 left-0 right-0 z-10 bg-linear-to-r from-brand-gold-dark to-brand-gold text-brand-charcoal text-[9px] font-bold text-center py-1 uppercase tracking-widest">
            🏷️ Limited Deal
          </div>
        )}
      </Link>

      {/* ── Card body ── */}
      <div className="flex flex-col flex-1 p-3 gap-1.5">

        {/* Category */}
        <span className="text-[10px] font-semibold text-brand-copper uppercase tracking-widest">
          {product.category.name}
        </span>

        {/* Product name */}
        <Link href={`/product/${product.id}`}>
          <h3 className="text-sm font-semibold text-gray-800 leading-snug min-h-10 flex-1 group-hover:text-brand-gold transition-colors duration-200">
            {product.name}
          </h3>
        </Link>

        {/* Star rating */}
        {product.rating != null && product.reviewCount != null && (
          <StarRating rating={product.rating} count={product.reviewCount} />
        )}

        {/* Urgency signal */}
        {isPopular && (
          <p className="text-[10px] font-bold text-red-600 flex items-center gap-1">
            <span>⚡</span> Only a few left!
          </p>
        )}

        {/* Price row */}
        <div className="flex items-baseline flex-wrap gap-x-2 gap-y-0.5 mt-0.5">
          <span className="text-base font-bold text-gray-900">
            {formatPrice(product.price)}
          </span>
          {product.mrp && product.mrp > product.price && (
            <span className="text-xs text-gray-400 line-through">
              {formatPrice(product.mrp)}
            </span>
          )}
          {product.discount && (
            <span className="text-xs font-bold text-green-600">
              {product.discount}% off
            </span>
          )}
        </div>

        {/* Add to Cart */}
        {inStock ? (
          <button
            onClick={handleAddToCart}
            className={`mt-2 w-full py-2.5 rounded-lg text-xs font-bold transition-all duration-150 shadow-sm active:scale-[0.97] ${
              btnState === 'added'
                ? 'bg-green-500 text-white'
                : btnState === 'maxStock'
                ? 'bg-orange-400 text-white cursor-not-allowed'
                : 'text-brand-charcoal bg-linear-to-r from-brand-gold to-brand-amber hover:from-brand-gold-dark hover:to-brand-gold hover:shadow-md'
            }`}
          >
            {btnState === 'added'    ? '✓ Added'          :
             btnState === 'maxStock' ? 'Max Stock Reached' :
             'Add to Cart'}
          </button>
        ) : (
          <button
            disabled
            className="mt-2 w-full py-2.5 rounded-lg text-xs font-semibold text-gray-400 bg-gray-100 cursor-not-allowed"
          >
            Out of Stock
          </button>
        )}

      </div>
    </div>
  );
}
