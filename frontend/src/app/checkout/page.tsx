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
import {
  getAddresses,
  saveAddress,
  type SavedAddress,
  type AddressInput,
} from '@/services/address.service';
import { createRazorpayOrder, verifyPayment, loadRazorpayScript } from '@/services/payment.service';
import { formatPrice } from '@/lib/utils';

// ── Types ─────────────────────────────────────────────────────────────────────

type FormErrors = Partial<Record<keyof AddressInput, string>>;

const EMPTY_FORM: AddressInput = {
  fullName: '', phone: '', address: '', city: '', state: '', pincode: '',
};

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa',
  'Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala',
  'Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland',
  'Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura',
  'Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu & Kashmir',
  'Ladakh','Puducherry','Chandigarh',
];

// ── Field component ───────────────────────────────────────────────────────────

function Field({
  label, name, value, onChange, error, placeholder, type = 'text', textarea = false,
}: {
  label: string; name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
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

// ── Saved Address Card ────────────────────────────────────────────────────────

function AddressCard({
  addr,
  selected,
  onSelect,
}: {
  addr:     SavedAddress;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left rounded-xl border p-4 transition-all ${
        selected
          ? 'border-brand-gold bg-amber-50/60 ring-1 ring-brand-gold/30 shadow-sm'
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-1 w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
          selected ? 'border-brand-gold' : 'border-gray-300'
        }`}>
          {selected && <div className="w-2 h-2 rounded-full bg-brand-gold" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-bold text-gray-800">{addr.fullName}</p>
            {addr.isDefault && (
              <span className="text-[10px] font-bold bg-brand-gold/20 text-amber-700 px-1.5 py-0.5 rounded-full">
                Default
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{addr.phone}</p>
          <p className="text-sm text-gray-600 mt-1 leading-relaxed">
            {addr.address}, {addr.city}, {addr.state} – {addr.pincode}
          </p>
        </div>
      </div>
    </button>
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

  useEffect(() => {
    if (!mounted) return;
    if (!useAuthStore.getState().token) { router.replace('/login?redirect=/checkout'); return; }
    if (items.length === 0)             { router.replace('/cart'); return; }
  }, [mounted, items.length, router]);

  // ── Addresses ──────────────────────────────────────────────────────────────
  const [addresses,     setAddresses]     = useState<SavedAddress[]>([]);
  const [selectedId,    setSelectedId]    = useState<number | null>(null);
  const [addrsLoading,  setAddrsLoading]  = useState(true);
  const [showNewForm,   setShowNewForm]   = useState(false);

  // ── New address form state ─────────────────────────────────────────────────
  const [form,   setForm]   = useState<AddressInput>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});

  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!mounted) return;
    getAddresses()
      .then((addrs) => {
        setAddresses(addrs);
        // Pre-select default or first address
        const def = addrs.find(a => a.isDefault) ?? addrs[0];
        if (def) setSelectedId(def.id);
        else     setShowNewForm(true);   // no saved addresses → show form
      })
      .catch(() => setShowNewForm(true))
      .finally(() => setAddrsLoading(false));
  }, [mounted]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof AddressInput]) setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const validateForm = (): boolean => {
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

  // ── Get active addressId ───────────────────────────────────────────────────

  const getAddressId = async (): Promise<number> => {
    if (!showNewForm && selectedId) return selectedId;

    if (!validateForm()) throw new Error('Please fill all address fields');

    const saved = await saveAddress(form);
    setAddresses(prev => [...prev, saved]);
    setSelectedId(saved.id);
    setShowNewForm(false);
    return saved.id;
  };

  // ── Payment flow ───────────────────────────────────────────────────────────

  const handlePayment = async () => {
    if (isProcessing) return;
    if (!cartValid) { toast.error('Your cart has issues. Please review it.'); return; }

    setIsProcessing(true);

    try {
      const addressId = await getAddressId();

      const amountInPaise = Math.round(subtotal * 100);
      const rzpOrder      = await createRazorpayOrder(amountInPaise);
      await loadRazorpayScript();

      const prefillName = showNewForm
        ? form.fullName
        : (addresses.find(a => a.id === addressId)?.fullName ?? '');
      const prefillPhone = showNewForm
        ? form.phone
        : (addresses.find(a => a.id === addressId)?.phone ?? '');

      const rzp = new window.Razorpay({
        key:         rzpOrder.keyId,
        amount:      rzpOrder.amount,
        currency:    'INR',
        name:        'Vedic Vessels',
        description: 'Sacred ritual items',
        order_id:    rzpOrder.orderId,
        prefill:     { name: prefillName, contact: prefillPhone },
        theme:       { color: '#C9A84C' },

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
      setIsProcessing(false);

    } catch (err: any) {
      toast.error(err?.message ?? 'Something went wrong. Please try again.');
      setIsProcessing(false);
    }
  };

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

          {/* ── Address section ── */}
          <div className="flex-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-gray-900">Delivery Address</h2>
                <Link
                  href="/profile/address"
                  className="text-xs font-semibold text-brand-gold hover:text-brand-gold-dark transition-colors"
                >
                  Manage Addresses
                </Link>
              </div>

              {addrsLoading ? (
                <div className="space-y-3">
                  {[1, 2].map(i => (
                    <div key={i} className="h-24 rounded-xl bg-gray-100 animate-pulse" />
                  ))}
                </div>
              ) : (
                <>
                  {/* Saved address cards */}
                  {addresses.length > 0 && (
                    <div className="space-y-3 mb-4">
                      {addresses.map(addr => (
                        <AddressCard
                          key={addr.id}
                          addr={addr}
                          selected={!showNewForm && selectedId === addr.id}
                          onSelect={() => { setSelectedId(addr.id); setShowNewForm(false); }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Add new address toggle */}
                  {addresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => { setShowNewForm(s => !s); if (!showNewForm) setSelectedId(null); }}
                      className={`w-full rounded-xl border border-dashed p-4 text-sm font-semibold transition-all ${
                        showNewForm
                          ? 'border-brand-gold text-brand-gold bg-amber-50/40'
                          : 'border-gray-300 text-gray-500 hover:border-brand-gold hover:text-brand-gold'
                      }`}
                    >
                      {showNewForm ? '✕ Cancel new address' : '+ Use a different address'}
                    </button>
                  )}

                  {/* New address form */}
                  {showNewForm && (
                    <div className="mt-4 space-y-4">
                      <Field label="Full Name" name="fullName" value={form.fullName} onChange={handleFormChange} error={errors.fullName} placeholder="Rahul Shinde" />
                      <Field label="Phone Number" name="phone" value={form.phone} onChange={handleFormChange} error={errors.phone} placeholder="+91 98765 43210" type="tel" />
                      <Field label="Address / Street" name="address" value={form.address} onChange={handleFormChange} error={errors.address} placeholder="Flat 4B, Lotus Heights, MG Road" textarea />
                      <div className="grid grid-cols-2 gap-4">
                        <Field label="City" name="city" value={form.city} onChange={handleFormChange} error={errors.city} placeholder="Mumbai" />
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1.5">State</label>
                          <select
                            name="state"
                            value={form.state}
                            onChange={handleFormChange}
                            className={`w-full px-4 py-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/20 transition-all ${
                              errors.state ? 'border-red-400 bg-red-50' : 'border-gray-300 focus:border-brand-gold'
                            }`}
                          >
                            <option value="">Select state</option>
                            {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                          {errors.state && <p className="mt-1 text-[11px] text-red-500">{errors.state}</p>}
                        </div>
                      </div>
                      <div className="w-1/2 pr-2">
                        <Field label="Pincode" name="pincode" value={form.pincode} onChange={handleFormChange} error={errors.pincode} placeholder="400001" />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* ── Order summary ── */}
          <div className="lg:w-72 shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-24">
              <h2 className="text-base font-bold text-gray-900 mb-4">Order Summary</h2>

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
                disabled={isProcessing || addrsLoading || (!showNewForm && !selectedId)}
                className={`mt-5 w-full py-3 rounded-lg text-sm font-bold transition-all duration-150 shadow-sm ${
                  isProcessing || addrsLoading || (!showNewForm && !selectedId)
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
