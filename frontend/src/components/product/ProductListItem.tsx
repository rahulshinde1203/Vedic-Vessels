'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Star } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import api from '../../lib/api';
import { useAuthStore } from '../../store/auth.store';

interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  comparePrice?: number;
  images: string[];
  stock: number;
  isFeatured?: boolean;
  category: { name: string; slug: string };
}

export default function ProductListItem({ product }: { product: Product }) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const router = useRouter();

  const discount = product.comparePrice
    ? Math.round((1 - Number(product.price) / Number(product.comparePrice)) * 100)
    : null;

  const addToCart = useMutation({
    mutationFn: () => api.post('/cart/items', { productId: product.id, quantity: 1 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Added to cart');
    },
    onError: () => toast.error('Failed to add to cart'),
  });

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to add to cart');
      router.push('/auth/login');
      return;
    }
    addToCart.mutate();
  };

  return (
    <div className="group bg-white rounded-2xl border border-brand-100/80 shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden flex">
      {/* Image */}
      <Link
        href={`/shop/products/${product.slug}`}
        className="relative w-36 sm:w-48 flex-shrink-0 bg-cream-200 overflow-hidden"
      >
        {product.images?.[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            loading="lazy"
            sizes="192px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-100 to-brand-200">
            <span className="text-4xl opacity-50">🏺</span>
          </div>
        )}
        {discount && discount > 0 && (
          <span className="absolute top-2 left-2 badge bg-brand-600 text-white text-[10px]">
            −{discount}%
          </span>
        )}
      </Link>

      {/* Info */}
      <div className="flex flex-1 flex-col sm:flex-row items-start sm:items-center gap-4 p-4 md:p-5">
        <div className="flex-1 min-w-0">
          <p className="text-2xs font-semibold text-brand-400 uppercase tracking-widest mb-1">
            {product.category.name}
          </p>
          <Link href={`/shop/products/${product.slug}`}>
            <h3 className="font-semibold text-brand-900 text-sm md:text-base leading-snug hover:text-brand-600 transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>
          {product.description && (
            <p className="text-brand-400 text-xs mt-1 line-clamp-2 hidden sm:block leading-relaxed">
              {product.description}
            </p>
          )}
          <div className="flex items-center gap-1 mt-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={10} className={i < 4 ? 'fill-brand-400 text-brand-400' : 'fill-brand-200 text-brand-200'} />
            ))}
            <span className="text-2xs text-brand-400 ml-1">(24)</span>
          </div>
        </div>

        {/* Price + CTA */}
        <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-2 flex-shrink-0">
          <div className="text-right">
            <p className="font-display font-bold text-brand-800 text-lg">
              ₹{Number(product.price).toLocaleString('en-IN')}
            </p>
            {product.comparePrice && (
              <p className="text-xs text-brand-300 line-through">
                ₹{Number(product.comparePrice).toLocaleString('en-IN')}
              </p>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0 || addToCart.isPending}
            className="btn-primary btn-sm flex-shrink-0 gap-1.5"
          >
            <ShoppingCart size={13} />
            {addToCart.isPending ? 'Adding…' : product.stock === 0 ? 'Sold out' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}
