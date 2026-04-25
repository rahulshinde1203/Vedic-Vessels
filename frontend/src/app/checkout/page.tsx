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
import { useAuthStore } from '@/store/auth.store';
import { saveAddress } from '@/services/address.service';
import { createRazorpayOrder, verifyPayment, loadRazorpayScript } from '@/services/payment.service';
import { formatPrice } from '@/lib/utils';

// ── Types ─────────────────────────────────────────────────────────────────────

interface AddressForm {
  fullName: string;
  phone:    string;
  address:  string;
  city:     string;
  state:    string;
  pincode:  string;
}

type FormErrors = Partial<Record<keyof AddressForm, string>>;

// ── Field component ───────────────────────────────────────────────────────────

function Field({
  label, name, value, onChange, error, placeholder, type = 'text', textarea = false,
}: {
  label: string; name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  error?: string; placeholder?: string; type?: string; textarea?: boolean;
}) {
  const cls = `w-full px-4 py-3 rounded-lg border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-gold/20 ${
    error ? 'border-red-400 bg-red-50' : 'border-gray-300 focus:border-brand-gold'
  }`;
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
      {textarea
        ? <textarea name={name} value={value} onChange={onChange} placeholder={placeholder} rows={3} className={cls} />
        : <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} className={cls} />
      }
      {error && <p className="mt-1 text-[11px] text-red-500">{error}</p>}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const subtotal   = useCartStore(selectCartTotal);
  const totalItems = useCartStore(selectCartCount);
  const cartValid  = useCartStore(selectIsCartValid);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Auth + cart guards
  useEffect(() => {
    if (!mounted) return;
    if (!useAuthStore.getState().token) { router.replace('/login?redirect=/checkout'); return; }
    if (items.length === 0)             { router.replace('/cart'); return; }
  }, [mounted, items.length, router]);

  const [form, setForm] = useState<AddressForm>({
    fullName: '', phone: '', address: '', city: '', state: '', pincode: '',
  });
  const [errors,       setErrors]       = useState<FormErrors>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof AddressForm]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!form.fullName.trim()) errs.fullName = 'Full name is required';
    if (!form.phone.trim()) {
      errs.phone = 'Phone number is required';
    } else if (!/^\+?[\d]{10,13}$/.test(form.phone.replace(/[\s\-()]/g, ''))) {
      errs.phone = 'Enter a valid phone number';
    }
    if (!form.address.trim()) errs.address = 'Address is required';
    if (!form.city.trim())    errs.city    = 'City is required';
    if (!form.state.trim())   errs.state   = 'State is required';
    if (!form.pincode.trim()) {
      errs.pincode = 'Pincode is required';
    } else if (!/^[1-9][0-9]{5}$/.test(form.pincode.trim())) {
      errs.pincode = 'Enter a valid 6-digit pincode';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePayment = async () => {
    if (!validate() || isProcessing) return;
    if (!cartValid) { toast.error('Your cart has issues. Please review it.'); return; }

    setIsProcessing(true);

    try {
      // 1. Save address → get addressId
      const saved       = await saveAddress(form);
      const addressId   = saved.id;

      // 2. Create Razorpay order
      const amountInPaise = Math.round(subtotal * 100);
      const rzpOrder      = await createRazorpayOrder(amountInPaise);

      // 3. Load checkout script
      await loadRazorpayScript();

      // 4. Open Razorpay popup
      const rzp = new window.Razorpay({
        key:         rzpOrder.keyId,
        amount:      rzpOrder.amount,
        currency:    'INR',
        name:        'Vedic Vessels',
        description: 'Sacred ritual items',
        order_id:    rzpOrder.orderId,
        prefill: {
          name:    form.fullName,
          contact: form.phone,
        },
        theme: { color: '#C9A84C' },

        handler: async (response) => {
          setIsProcessing(true);
          try {
            const result = await verifyPayment({
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              cartItems:           items,
              totalAmount:         subtotal,
              addressId,
            });
            clearCart();
            router.push(`/order-success?orderId=${result.orderId}`);
          } catch (err: any) {
            toast.error(err?.message ?? 'Payment verification failed. Please contact support.');
            setIsProcessing(false);
          }
        },

        modal: { ondismiss: () => setIsProcessing(false) },
      });

      rzp.open();
      setIsProcessing(false); // popup is now open

    } catch (err: any) {
      toast.error(err?.message ?? 'Something went wrong. Please try again.');
      setIsProcessing(false);
    }
  };

  // Show nothing while hydrating
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-sm text-gray-400">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-6">
          <Link href="/cart" className="text-xs text-gray-400 hover:text-brand-gold transition-colors">
            ← Back to Cart
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">Checkout</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── Address form ── */}
          <div className="flex-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-base font-bold text-gray-900 mb-5">Delivery Address</h2>

              <div className="space-y-4">

                <Field
                  label="Full Name"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  error={errors.fullName}
                  placeholder="Rahul Shinde"
                />

                <Field
                  label="Phone Number"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  error={errors.phone}
                  placeholder="+91 98765 43210"
                  type="tel"
                />

                <Field
                  label="Address / Street"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  error={errors.address}
                  placeholder="Flat 4B, Lotus Heights, MG Road"
                  textarea
                />

                <div className="grid grid-cols-2 gap-4">
                  <Field
                    label="City"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    error={errors.city}
                    placeholder="Mumbai"
                  />
                  <Field
                    label="State"
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    error={errors.state}
                    placeholder="Maharashtra"
                  />
                </div>

                <div className="w-1/2 pr-2">
                  <Field
                    label="Pincode"
                    name="pincode"
                    value={form.pincode}
                    onChange={handleChange}
                    error={errors.pincode}
                    placeholder="400001"
                    type="text"
                  />
                </div>

              </div>
            </div>
          </div>

          {/* ── Order summary ── */}
          <div className="lg:w-72 shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-24">
              <h2 className="text-base font-bold text-gray-900 mb-4">Order Summary</h2>

              {/* Items */}
              <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm text-gray-600">
                    <span className="truncate pr-2">
                      {item.name}
                      <span className="text-gray-400 ml-1">× {item.quantity}</span>
                    </span>
                    <span className="shrink-0 font-medium text-gray-800">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'items'})</span>
                  <span className="font-medium text-gray-800">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>
                  <span className="font-semibold text-green-600">FREE</span>
                </div>
                <div className="pt-2 border-t border-gray-100 flex justify-between font-bold text-base">
                  <span className="text-gray-900">Total</span>
                  <span className="text-brand-gold">{formatPrice(subtotal)}</span>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className={`mt-5 w-full py-3 rounded-lg text-sm font-bold transition-all duration-150 shadow-sm ${
                  isProcessing
                    ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                    : 'text-brand-charcoal bg-brand-gold hover:bg-brand-gold-dark hover:shadow-md active:scale-[0.98]'
                }`}
              >
                {isProcessing ? 'Processing…' : `Pay ${formatPrice(subtotal)}`}
              </button>

              <p className="mt-3 text-center text-[11px] text-gray-400">
                Secured by Razorpay · 256-bit SSL
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
