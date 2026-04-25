import ShopFilters from '@/components/shared/ShopFilters';
import ProductCard from '@/components/ui/ProductCard';
import { fetchProducts } from '@/services/product.service';
import { CATEGORIES } from '@/constants';
import type { Product } from '@/types';

interface Props {
  searchParams: Promise<{ category?: string }>;
}

export default async function ShopPage({ searchParams }: Props) {
  const { category } = await searchParams;
  const categoryQuery = category ?? null;

  let products: Product[] = [];
  let fetchError = false;

  try {
    const raw = categoryQuery ? categoryQuery.replace(/\+/g, ' ') : undefined;
    products = await fetchProducts(raw ? { category: raw } : undefined);
  } catch {
    fetchError = true;
  }

  const categoryLabel = categoryQuery
    ? (CATEGORIES.find((c) => c.query === categoryQuery)?.name ?? 'Products')
    : 'All Products';

  return (
    <div className="bg-gray-100 min-h-screen">

      <ShopFilters activeCategory={categoryQuery} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{categoryLabel}</h1>
            {!fetchError && (
              <p className="text-sm text-gray-500">
                {products.length} {products.length === 1 ? 'product' : 'products'} found
              </p>
            )}
          </div>
        </div>

        {/* Error state */}
        {fetchError && (
          <p className="text-sm text-red-500 py-10 text-center">Failed to load products</p>
        )}

        {/* Product grid */}
        {!fetchError && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!fetchError && products.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="text-5xl mb-4">🔍</span>
            <p className="text-lg font-semibold text-gray-700 mb-1">No products in this category yet</p>
            <p className="text-sm text-gray-400 mb-6">Check back soon — we&apos;re adding new items regularly.</p>
            <a
              href="/shop"
              className="px-6 py-2.5 rounded-full bg-brand-gold text-brand-charcoal text-sm font-bold hover:bg-brand-gold-dark transition-colors duration-200"
            >
              Browse All Products
            </a>
          </div>
        )}

      </div>
    </div>
  );
}
