'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const orderId      = searchParams.get('orderId');

  useEffect(() => {
    toast.success('Order placed successfully!');
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center text-center px-4">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 max-w-md w-full">

        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
          <svg
            className="w-8 h-8 text-green-500"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h1>

        {orderId && (
          <p className="text-sm text-gray-400 mb-3">
            Order <span className="font-semibold text-gray-600">#{orderId}</span>
          </p>
        )}

        <p className="text-sm text-gray-500 mb-8">
          Thank you for your purchase. Your sacred items are on their way.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {orderId && (
            <Link
              href={`/orders/${orderId}`}
              className="inline-block px-8 py-3 rounded-full bg-brand-gold text-brand-charcoal text-sm font-bold hover:bg-brand-gold-dark active:scale-[0.98] transition-all duration-150 shadow-sm"
            >
              Track Order
            </Link>
          )}
          <Link
            href="/shop"
            className="inline-block px-8 py-3 rounded-full border border-gray-200 text-gray-600 text-sm font-semibold hover:border-brand-gold hover:text-brand-gold active:scale-[0.98] transition-all duration-150"
          >
            Continue Shopping
          </Link>
        </div>

      </div>
    </div>
  );
}
