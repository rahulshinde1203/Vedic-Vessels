'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Star } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import { useAuthStore } from '../../store/auth.store';
import { useRouter } from 'next/navigation';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  images: string[];
  stock: number;
  isFeatured?: boolean;
  category: { name: string; slug: string };
}

export default function ProductCard({ product }: { product: Product }) {
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
    <div className="group bg-white rounded-2xl border border-brand-100/80 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5 overflow-hidden flex flex-col">

      {/* Image */}
      <Link href={`/shop/products/${product.slug}`} className="relative block aspect-square bg-cream-200 overflow-hidden flex-shrink-0">
        {product.images?.[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            loading="lazy"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-100 to-brand-200">
            <span className="text-5xl opacity-60">🏺</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {discount && discount > 0 && (
            <span className="badge bg-brand-600 text-white text-[10px]">−{discount}%</span>
          )}
          {product.isFeatured && (
            <span className="badge bg-amber-400 text-amber-900 text-[10px]">Featured</span>
          )}
          {product.stock === 0 && (
            <span className="badge bg-gray-800/80 text-white text-[10px]">Sold out</span>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex-1">
          <p className="text-2xs font-semibold text-brand-400 uppercase tracking-widest mb-1">
            {product.category.name}
          </p>
          <Link href={`/shop/products/${product.slug}`}>
            <h3 className="text-sm font-semibold text-brand-900 leading-snug line-clamp-2 hover:text-brand-600 transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Inline rating (static for now) */}
          <div className="flex items-center gap-1 mt-1.5 mb-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={10} className={i < 4 ? 'fill-brand-400 text-brand-400' : 'fill-brand-200 text-brand-200'} />
            ))}
            <span className="text-2xs text-brand-400 ml-0.5">(24)</span>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="font-display font-bold text-base text-brand-800">
            ₹{Number(product.price).toLocaleString('en-IN')}
          </span>
          {product.comparePrice && (
            <span className="text-xs text-brand-300 line-through">
              ₹{Number(product.comparePrice).toLocaleString('en-IN')}
            </span>
          )}
        </div>

        {/* CTA */}
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0 || addToCart.isPending}
          className="btn-primary w-full text-sm py-2.5 gap-1.5 group/btn"
        >
          <ShoppingCart size={15} className="transition-transform group-hover/btn:-translate-y-px" />
          {addToCart.isPending ? 'Adding…' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}
