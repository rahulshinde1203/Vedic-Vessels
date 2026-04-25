import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { fetchProductById } from '@/services/product.service';
import { formatPrice } from '@/lib/utils';
import ImageGallery from '@/components/shared/ImageGallery';
import ProductActions from '@/components/shared/ProductActions';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Props {
  params: Promise<{ id: string }>;
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const product = await fetchProductById(Number(id));
    return {
      title:       `${product.name} | Vedic Vessels`,
      description: product.description ?? `Buy ${product.name} from Vedic Vessels`,
    };
  } catch {
    return { title: 'Product | Vedic Vessels' };
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function StarRating({ rating = 4.2, count = 128 }: { rating?: number; count?: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-px">
        {Array.from({ length: 5 }, (_, i) => {
          const filled = i < Math.floor(rating);
          const half   = !filled && i === Math.floor(rating) && rating % 1 >= 0.5;
          return (
            <svg
              key={i}
              className={`w-4 h-4 ${filled || half ? 'text-amber-400' : 'text-gray-300'}`}
              fill={filled ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth={filled ? 0 : 1.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round" strokeLinejoin="round"
                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              />
            </svg>
          );
        })}
      </div>
      <span className="text-sm font-bold text-gray-800">{rating.toFixed(1)}</span>
      <span className="text-sm text-gray-400">({count.toLocaleString()} reviews)</span>
    </div>
  );
}

function StockBadge({ stock, isActive }: { stock: number; isActive: boolean }) {
  if (!isActive || stock === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-600">
        <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
        Out of Stock
      </span>
    );
  }
  if (stock <= 5) {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-600">
        <span className="w-2 h-2 rounded-full bg-orange-400 inline-block" />
        Only {stock} left in stock — order soon
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-600">
      <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
      In Stock
    </span>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const numId  = Number(id);

  if (!Number.isFinite(numId) || numId <= 0) notFound();

  let product;
  try {
    product = await fetchProductById(numId);
  } catch {
    notFound();
  }

  const images  = (product.images && product.images.length > 0)
    ? product.images
    : (product.imageUrl ? [product.imageUrl] : []);

  const discount = product.discountPercent ?? product.discount ?? 0;
  const saving   = product.mrp ? product.mrp - product.price : 0;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">

        {/* ── Breadcrumb ──────────────────────────────────────────── */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6 flex-wrap">
          <Link href="/"    className="hover:text-brand-gold transition-colors">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-brand-gold transition-colors">Shop</Link>
          <span>/</span>
          <Link
            href={`/shop?category=${encodeURIComponent(product.category.name)}`}
            className="hover:text-brand-gold transition-colors"
          >
            {product.category.name}
          </Link>
          <span>/</span>
          <span className="text-gray-700 font-medium truncate max-w-48">{product.name}</span>
        </nav>

        {/* ── Main layout ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">

          {/* ── LEFT: Image Gallery ── */}
          <div className="w-full">
            <ImageGallery images={images} productName={product.name} />
          </div>

          {/* ── RIGHT: Product Info ── */}
          <div className="flex flex-col gap-5">

            {/* Category tag */}
            <span className="text-xs font-bold text-brand-copper uppercase tracking-widest">
              {product.category.name}
            </span>

            {/* Product name */}
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-charcoal leading-snug">
              {product.name}
            </h1>

            {/* Static star rating */}
            <StarRating rating={product.rating ?? 4.2} count={product.reviewCount ?? 128} />

            {/* Divider */}
            <div className="h-px bg-gray-200" />

            {/* Price section */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(product.price)}
                </span>
                {product.mrp && product.mrp > product.price && (
                  <span className="text-lg text-gray-400 line-through">
                    {formatPrice(product.mrp)}
                  </span>
                )}
                {discount > 0 && (
                  <span className="text-sm font-bold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                    {Math.round(discount)}% OFF
                  </span>
                )}
              </div>
              {saving > 0 && (
                <p className="text-sm text-green-700 font-medium">
                  You save {formatPrice(saving)}
                </p>
              )}
              <p className="text-xs text-gray-400">Inclusive of all taxes</p>
            </div>

            {/* Stock status */}
            <StockBadge stock={product.stock} isActive={product.isActive} />

            {/* Actions */}
            <ProductActions product={product} />

            {/* Trust signals */}
            <div className="grid grid-cols-3 gap-3 pt-1">
              {[
                { icon: '🚚', label: 'Free Delivery', sub: 'On orders above ₹499' },
                { icon: '🔄', label: 'Easy Returns',  sub: '7-day return policy' },
                { icon: '✅', label: 'Authentic',      sub: '100% genuine products' },
              ].map(({ icon, label, sub }) => (
                <div key={label} className="flex flex-col items-center text-center gap-1 p-2.5 bg-white rounded-xl border border-gray-100 shadow-sm">
                  <span className="text-lg">{icon}</span>
                  <span className="text-[10px] font-bold text-gray-700 leading-tight">{label}</span>
                  <span className="text-[9px] text-gray-400 leading-tight">{sub}</span>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-200" />

            {/* Description */}
            {product.description && (
              <div className="flex flex-col gap-3">
                <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                  About this product
                </h2>
                {product.description.includes('\n') ? (
                  <ul className="space-y-2">
                    {product.description.split('\n').filter(Boolean).map((line, i) => (
                      <li key={i} className="text-sm text-gray-600 leading-relaxed flex gap-2">
                        <span className="text-brand-gold mt-0.5 shrink-0">•</span>
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {product.description}
                  </p>
                )}
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
