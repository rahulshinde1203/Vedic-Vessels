import type { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import Button from './Button';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="group bg-white rounded-sm border border-brand-cream-dark hover:border-brand-gold/40 hover:shadow-md transition-all duration-300 overflow-hidden">
      {/* Image placeholder */}
      <div className="aspect-square bg-brand-cream-dark flex items-center justify-center">
        <svg
          className="w-14 h-14 text-brand-gold/30 group-hover:text-brand-gold/50 transition-colors duration-300"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
        </svg>
      </div>

      {/* Info */}
      <div className="p-4">
        <span className="text-[10px] text-brand-gold uppercase tracking-widest font-medium">
          {product.category}
        </span>

        <h3 className="font-serif text-brand-charcoal mt-1 mb-1 text-sm leading-snug group-hover:text-brand-gold transition-colors duration-200">
          {product.name}
        </h3>

        <div className="flex items-center justify-between mt-3">
          <span className="font-semibold text-brand-charcoal text-sm">
            {formatPrice(product.price)}
          </span>

          {product.inStock ? (
            <Button variant="outline" size="sm">
              Add to Cart
            </Button>
          ) : (
            <span className="text-[11px] text-red-400 font-medium">Out of Stock</span>
          )}
        </div>
      </div>
    </div>
  );
}
