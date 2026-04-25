'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ui/ProductCard';
import { fetchProducts } from '@/services/product.service';
import type { Product } from '@/types';

// ── Types ─────────────────────────────────────────────────────────────────────

interface ProductGridProps {
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: 'orange' | 'red' | 'green' | 'gold';
  products?: Product[];
  viewAllHref?: string;
}

// ── Badge color map ───────────────────────────────────────────────────────────

const BADGE_CLASSES: Record<NonNullable<ProductGridProps['badgeColor']>, string> = {
  orange: 'bg-orange-500 text-white',
  red:    'bg-red-500    text-white',
  green:  'bg-green-600  text-white',
  gold:   'bg-brand-gold text-brand-charcoal',
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function ProductGrid({
  title,
  subtitle,
  badge,
  badgeColor = 'orange',
  products: productsProp,
  viewAllHref = '/shop',
}: ProductGridProps) {
  const shouldFetch = productsProp === undefined;
  const [products, setProducts] = useState<Product[]>(productsProp ?? []);
  const [loading, setLoading] = useState(shouldFetch);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shouldFetch) return;
    fetchProducts()
      .then(setProducts)
      .catch(() => setError('Failed to load products'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="bg-white py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Section header ── */}
        <div className="flex items-end justify-between mb-7">
          <div className="border-l-4 border-brand-gold pl-3">
            <div className="flex items-center gap-2.5 mb-1">
              {badge && (
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm ${BADGE_CLASSES[badgeColor]}`}>
                  {badge}
                </span>
              )}
              <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            </div>
            {subtitle && (
              <p className="text-sm text-gray-500">{subtitle}</p>
            )}
          </div>

          <Link
            href={viewAllHref}
            className="text-sm font-semibold text-brand-gold hover:text-brand-gold-dark hover:underline underline-offset-2 shrink-0 transition-colors duration-200"
          >
            View All →
          </Link>
        </div>

        {/* ── States ── */}
        {loading && (
          <p className="text-sm text-gray-500 py-10 text-center">Loading products…</p>
        )}

        {error && (
          <p className="text-sm text-red-500 py-10 text-center">{error}</p>
        )}

        {/* ── Grid ── */}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* ── Mobile "View All" CTA ── */}
        {!loading && !error && (
          <div className="mt-7 text-center sm:hidden">
            <Link
              href={viewAllHref}
              className="inline-block px-8 py-2.5 border-2 border-brand-gold text-sm font-semibold text-brand-gold rounded-full hover:bg-brand-gold hover:text-brand-charcoal transition-colors duration-200"
            >
              View All Products
            </Link>
          </div>
        )}

      </div>
    </section>
  );
}
