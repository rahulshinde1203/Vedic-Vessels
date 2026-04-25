'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/auth.store';
import {
  getAddresses,
  saveAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  type SavedAddress,
  type AddressInput,
} from '@/services/address.service';

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
  const cls = `w-full px-3.5 py-2.5 rounded-lg border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-gold/20 ${
    error ? 'border-red-400 bg-red-50' : 'border-gray-300 focus:border-brand-gold'
  }`;
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
      {textarea
        ? <textarea name={name} value={value} onChange={onChange} placeholder={placeholder} rows={2} className={cls} />
        : <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} className={cls} />
      }
      {error && <p className="mt-1 text-[11px] text-red-500">{error}</p>}
    </div>
  );
}

// ── Address Form Modal ────────────────────────────────────────────────────────

function AddressFormModal({
  initial,
  onClose,
  onSaved,
}: {
  initial?: SavedAddress;
  onClose: () => void;
  onSaved: (addr: SavedAddress) => void;
}) {
  const [form,    setForm]    = useState<AddressInput>(initial ? {
    fullName: initial.fullName,
    phone:    initial.phone,
    address:  initial.address,
    city:     initial.city,
    state:    initial.state,
    pincode:  initial.pincode,
  } : EMPTY_FORM);
  const [errors,  setErrors]  = useState<FormErrors>({});
  const [saving,  setSaving]  = useState(false);
  const isEdit = !!initial;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof AddressInput]) setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!form.fullName.trim()) errs.fullName = 'Full name is required';
    if (!form.phone.trim()) {
      errs.phone = 'Phone is required';
    } else if (!/^\+?[\d\s\-()]{10,15}$/.test(form.phone.replace(/[\s\-()]/g, ''))) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || saving) return;
    setSaving(true);
    try {
      const saved = isEdit
        ? await updateAddress(initial!.id, form)
        : await saveAddress(form);
      onSaved(saved);
      toast.success(isEdit ? 'Address updated' : 'Address added');
      onClose();
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="text-sm font-bold text-gray-800">{isEdit ? 'Edit Address' : 'Add New Address'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
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
            label="Street / Flat / Area"
            name="address"
            value={form.address}
            onChange={handleChange}
            error={errors.address}
            placeholder="Flat 4B, Lotus Heights, MG Road"
            textarea
          />
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="City"
              name="city"
              value={form.city}
              onChange={handleChange}
              error={errors.city}
              placeholder="Pune"
            />
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">State</label>
              <select
                name="state"
                value={form.state}
                onChange={handleChange}
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-gold/20 ${
                  errors.state ? 'border-red-400 bg-red-50' : 'border-gray-300 focus:border-brand-gold'
                }`}
              >
                <option value="">Select state</option>
                {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.state && <p className="mt-1 text-[11px] text-red-500">{errors.state}</p>}
            </div>
          </div>
          <div className="w-1/2 pr-1.5">
            <Field
              label="Pincode"
              name="pincode"
              value={form.pincode}
              onChange={handleChange}
              error={errors.pincode}
              placeholder="411001"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-lg bg-brand-gold text-brand-charcoal text-sm font-bold hover:bg-brand-gold-dark disabled:opacity-60 transition-colors"
            >
              {saving ? 'Saving…' : (isEdit ? 'Update Address' : 'Save Address')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Address Card ──────────────────────────────────────────────────────────────

function AddressCard({
  addr,
  onEdit,
  onDelete,
  onSetDefault,
}: {
  addr:         SavedAddress;
  onEdit:       () => void;
  onDelete:     () => void;
  onSetDefault: () => void;
}) {
  return (
    <div className={`relative rounded-xl border p-5 transition-all ${
      addr.isDefault
        ? 'border-brand-gold bg-amber-50/50 shadow-sm'
        : 'border-gray-200 bg-white hover:border-gray-300'
    }`}>
      {addr.isDefault && (
        <span className="absolute top-3 right-3 text-[10px] font-bold bg-brand-gold text-brand-charcoal px-2 py-0.5 rounded-full">
          DEFAULT
        </span>
      )}

      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-xl shrink-0">🏠</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-800">{addr.fullName}</p>
          <p className="text-sm text-gray-600 mt-0.5">{addr.phone}</p>
          <p className="text-sm text-gray-500 mt-1 leading-relaxed">
            {addr.address}, {addr.city}, {addr.state} – {addr.pincode}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100">
        <button
          onClick={onEdit}
          className="text-xs font-semibold text-brand-gold hover:text-brand-gold-dark transition-colors"
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          className="text-xs font-semibold text-red-400 hover:text-red-600 transition-colors"
        >
          Delete
        </button>
        {!addr.isDefault && (
          <button
            onClick={onSetDefault}
            className="ml-auto text-xs font-semibold text-gray-500 hover:text-brand-gold transition-colors"
          >
            Set as Default
          </button>
        )}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AddressPage() {
  const router = useRouter();
  const token  = useAuthStore((s) => s.token);

  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [editAddr,  setEditAddr]  = useState<SavedAddress | undefined>(undefined);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    if (!token) { router.replace('/login'); return; }
    getAddresses()
      .then(setAddresses)
      .catch(() => toast.error('Failed to load addresses'))
      .finally(() => setLoading(false));
  }, [token, router]);

  const handleSaved = (saved: SavedAddress) => {
    setAddresses(prev => {
      const exists = prev.find(a => a.id === saved.id);
      if (exists) return prev.map(a => a.id === saved.id ? saved : a);
      // New address — if isDefault, clear others
      const base = saved.isDefault ? prev.map(a => ({ ...a, isDefault: false })) : prev;
      return [...base, saved];
    });
  };

  const handleDelete = async (addr: SavedAddress) => {
    if (!confirm(`Delete address for ${addr.fullName}?`)) return;
    setDeletingId(addr.id);
    try {
      await deleteAddress(addr.id);
      setAddresses(prev => {
        const remaining = prev.filter(a => a.id !== addr.id);
        // If deleted was default, promote the first remaining
        if (addr.isDefault && remaining.length > 0) {
          remaining[0] = { ...remaining[0], isDefault: true };
        }
        return remaining;
      });
      toast.success('Address deleted');
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to delete address');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetDefault = async (addr: SavedAddress) => {
    try {
      await setDefaultAddress(addr.id);
      setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === addr.id })));
      toast.success('Default address updated');
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to set default address');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 lg:py-12">

        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-gray-400">
          <Link href="/" className="hover:text-brand-gold transition-colors">Home</Link>
          <span>/</span>
          <Link href="/profile" className="hover:text-brand-gold transition-colors">Profile</Link>
          <span>/</span>
          <span className="text-gray-600 font-medium">Addresses</span>
        </nav>

        <div className="flex items-center justify-between mb-6">
          <h1 className="font-serif text-2xl font-bold text-brand-charcoal">Saved Addresses</h1>
          <button
            onClick={() => { setEditAddr(undefined); setShowForm(true); }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-gold text-brand-charcoal text-sm font-bold hover:bg-brand-gold-dark transition-colors"
          >
            <span className="text-base leading-none">+</span>
            Add New
          </button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-32 bg-white rounded-xl animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : addresses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="text-5xl mb-4">📍</span>
            <p className="text-lg font-semibold text-gray-700 mb-1">No saved addresses</p>
            <p className="text-sm text-gray-400 mb-6">Add an address for faster checkout.</p>
            <button
              onClick={() => { setEditAddr(undefined); setShowForm(true); }}
              className="px-6 py-2.5 rounded-full bg-brand-gold text-brand-charcoal text-sm font-bold hover:bg-brand-gold-dark transition-colors"
            >
              Add Address
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {addresses.map((addr) => (
              <div key={addr.id} className={deletingId === addr.id ? 'opacity-50 pointer-events-none' : ''}>
                <AddressCard
                  addr={addr}
                  onEdit={() => { setEditAddr(addr); setShowForm(true); }}
                  onDelete={() => handleDelete(addr)}
                  onSetDefault={() => handleSetDefault(addr)}
                />
              </div>
            ))}
          </div>
        )}

      </div>

      {showForm && (
        <AddressFormModal
          initial={editAddr}
          onClose={() => { setShowForm(false); setEditAddr(undefined); }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
