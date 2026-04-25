'use client';

import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import {
  fetchAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  type AdminProduct,
} from '@/services/products.service';
import { fetchAdminCategories, type AdminCategory } from '@/services/categories.service';

// ── Image Upload Grid ──────────────────────────────────────────────────────────

function ImageGrid({
  previews,
  onAdd,
  onRemove,
  error,
}: {
  previews: string[];
  onAdd:    (files: FileList) => void;
  onRemove: (index: number) => void;
  error?:   string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-semibold text-slate-600">
          Images <span className="text-red-400">*</span>
        </label>
        <span className="text-[11px] text-slate-400">{previews.length}/5</span>
      </div>

      <div className="grid grid-cols-4 gap-2.5">
        {previews.map((url, i) => (
          <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 group border border-slate-200">
            <img src={url} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />

            {/* Remove button */}
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/60 text-white text-xs leading-none flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
            >
              ×
            </button>

            {/* Cover badge */}
            {i === 0 && (
              <span className="absolute bottom-1.5 left-1.5 text-[9px] font-bold uppercase tracking-wide bg-brand-gold text-white px-1.5 py-0.5 rounded-full">
                Cover
              </span>
            )}
          </div>
        ))}

        {/* Add slot */}
        {previews.length < 5 && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="aspect-square rounded-xl border-2 border-dashed border-slate-200 hover:border-brand-gold bg-slate-50 hover:bg-amber-50/50 transition-colors flex flex-col items-center justify-center gap-1 group"
          >
            <svg className="w-5 h-5 text-slate-300 group-hover:text-brand-gold transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-[10px] text-slate-400 group-hover:text-brand-gold transition-colors">
              {previews.length === 0 ? 'Add photo' : 'More'}
            </span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => { if (e.target.files?.length) onAdd(e.target.files); e.target.value = ''; }}
      />

      {error && <p className="mt-1.5 text-[11px] text-red-500">{error}</p>}
      <p className="mt-1.5 text-[11px] text-slate-400">First image is the cover. Max 5 images, 5 MB each.</p>
    </div>
  );
}

// ── Price Section ──────────────────────────────────────────────────────────────

function PriceFields({
  mrp, price, onMrp, onPrice, mrpError, priceError,
}: {
  mrp:        string;
  price:      string;
  onMrp:      (v: string) => void;
  onPrice:    (v: string) => void;
  mrpError?:  string;
  priceError?: string;
}) {
  const mrpNum   = parseFloat(mrp);
  const priceNum = parseFloat(price);
  const discount =
    mrpNum > 0 && priceNum > 0 && priceNum < mrpNum
      ? Math.round(((mrpNum - priceNum) / mrpNum) * 100)
      : 0;
  const saving = mrpNum > 0 && priceNum > 0 ? mrpNum - priceNum : 0;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            MRP (₹) <span className="text-red-400">*</span>
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={mrp}
            onChange={(e) => onMrp(e.target.value)}
            placeholder="999"
            className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:border-brand-gold transition-colors ${
              mrpError ? 'border-red-400 bg-red-50' : 'border-slate-300'
            }`}
          />
          {mrpError && <p className="mt-1 text-[11px] text-red-500">{mrpError}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            Selling Price (₹) <span className="text-red-400">*</span>
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => onPrice(e.target.value)}
            placeholder="799"
            className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:border-brand-gold transition-colors ${
              priceError ? 'border-red-400 bg-red-50' : 'border-slate-300'
            }`}
          />
          {priceError && <p className="mt-1 text-[11px] text-red-500">{priceError}</p>}
        </div>
      </div>

      {/* Live discount indicator */}
      {discount > 0 && saving > 0 && (
        <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
          <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <p className="text-xs font-semibold text-emerald-700">
            ₹{saving.toLocaleString('en-IN')} OFF
            <span className="font-bold ml-1 text-emerald-600">({discount}% off)</span>
          </p>
        </div>
      )}

      {priceError === undefined && mrpNum > 0 && priceNum > mrpNum && (
        <p className="text-[11px] text-red-500">Selling price cannot exceed MRP</p>
      )}
    </div>
  );
}

// ── Product Modal ──────────────────────────────────────────────────────────────

interface ModalState {
  name:        string;
  description: string;
  mrp:         string;
  price:       string;
  stock:       string;
  categoryId:  string;
  isActive:    boolean;
}

function ProductModal({
  product,
  categories,
  onClose,
  onSave,
}: {
  product:    AdminProduct | null;
  categories: AdminCategory[];
  onClose:    () => void;
  onSave:     (p: AdminProduct) => void;
}) {
  const isEdit = !!product;

  const [form, setForm] = useState<ModalState>({
    name:        product?.name        ?? '',
    description: product?.description ?? '',
    mrp:         product ? String(product.mrp) : '',
    price:       product ? String(product.price) : '',
    stock:       product ? String(product.stock) : '0',
    categoryId:  product ? String(product.categoryId) : (categories[0]?.id ? String(categories[0].id) : ''),
    isActive:    product?.isActive ?? true,
  });

  const [files,    setFiles]    = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>(
    isEdit ? (product?.images ?? (product?.imageUrl ? [product.imageUrl] : [])) : [],
  );
  const [errors,  setErrors]   = useState<Partial<ModalState & { images: string }>>({});
  const [saving,  setSaving]   = useState(false);
  const [step,    setStep]     = useState<'idle' | 'creating' | 'uploading' | 'done'>('idle');

  // Track which previews are new local files vs existing URLs
  const existingCount = isEdit
    ? (product?.images?.length ?? (product?.imageUrl ? 1 : 0))
    : 0;

  const handleAdd = (fileList: FileList) => {
    const incoming = Array.from(fileList);
    const totalAfter = files.length + incoming.length + (isEdit ? existingCount : 0);
    if (totalAfter > 5) {
      toast.error(`Max 5 images allowed (${5 - files.length - (isEdit ? existingCount : 0)} more)`);
      return;
    }
    const newPreviews = incoming.map((f) => URL.createObjectURL(f));
    setFiles((prev) => [...prev, ...incoming]);
    setPreviews((prev) => [...prev, ...newPreviews]);
    setErrors((prev) => ({ ...prev, images: undefined }));
  };

  const handleRemove = (index: number) => {
    if (isEdit && index < existingCount) {
      toast('Existing images cannot be removed individually. Upload new images to replace all.');
      return;
    }
    const fileIndex = index - (isEdit ? existingCount : 0);
    URL.revokeObjectURL(previews[index]);
    setFiles((prev)    => prev.filter((_, i) => i !== fileIndex));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = (): boolean => {
    const errs: typeof errors = {};
    if (!form.name.trim())         errs.name       = 'Name is required';
    if (!form.categoryId)          errs.categoryId = 'Select a category';
    if (!form.mrp)                 errs.mrp        = 'MRP is required';
    if (!form.price)               errs.price      = 'Selling price is required';
    if (!form.stock && form.stock !== '0') errs.stock = 'Stock is required';

    const mrpNum   = parseFloat(form.mrp);
    const priceNum = parseFloat(form.price);
    if (mrpNum <= 0)              errs.mrp   = 'MRP must be greater than 0';
    if (priceNum <= 0)            errs.price = 'Price must be greater than 0';
    if (priceNum > mrpNum)        errs.price = 'Cannot exceed MRP';

    if (!isEdit && files.length === 0) {
      errs.images = 'At least one image is required';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || saving) return;

    setSaving(true);

    try {
      const fd = new FormData();
      fd.append('name',        form.name.trim());
      fd.append('description', form.description);
      fd.append('mrp',         form.mrp);
      fd.append('price',       form.price);
      fd.append('stock',       form.stock);
      fd.append('categoryId',  form.categoryId);
      if (isEdit) fd.append('isActive', String(form.isActive));

      if (!isEdit) {
        setStep('creating');
      } else {
        setStep('uploading');
      }

      files.forEach((f) => fd.append('images', f));

      const saved = isEdit
        ? await updateAdminProduct(product!.id, fd)
        : await createAdminProduct(fd);

      setStep('done');
      onSave(saved);
      toast.success(isEdit ? 'Product updated' : 'Product created successfully!');
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to save product');
      setStep('idle');
    } finally {
      setSaving(false);
    }
  };

  const field = (
    label: string,
    name: keyof ModalState,
    opts?: { placeholder?: string; type?: string; required?: boolean },
  ) => (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
        {label} {opts?.required && <span className="text-red-400">*</span>}
      </label>
      <input
        type={opts?.type ?? 'text'}
        name={name}
        value={form[name] as string}
        onChange={(e) => {
          setForm((p) => ({ ...p, [name]: e.target.value }));
          setErrors((p) => ({ ...p, [name]: undefined }));
        }}
        placeholder={opts?.placeholder}
        className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:border-brand-gold transition-colors ${
          errors[name] ? 'border-red-400 bg-red-50' : 'border-slate-300'
        }`}
      />
      {errors[name] && <p className="mt-1 text-[11px] text-red-500">{errors[name]}</p>}
    </div>
  );

  const stepLabel = step === 'creating'  ? 'Creating product…'
                  : step === 'uploading' ? 'Uploading images…'
                  : step === 'done'      ? 'Done!'
                  : isEdit               ? 'Save Changes'
                  : 'Create Product';

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[92vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-sm font-bold text-slate-800">
              {isEdit ? 'Edit Product' : 'Add New Product'}
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {isEdit ? 'Update product details' : 'Fill in details and upload images'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Images */}
          <ImageGrid
            previews={previews}
            onAdd={handleAdd}
            onRemove={handleRemove}
            error={errors.images}
          />

          {/* Name */}
          {field('Product Name', 'name', { placeholder: 'Brass Diya Set', required: true })}

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="A handcrafted brass diya set…"
              rows={3}
              className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-brand-gold transition-colors resize-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Category <span className="text-red-400">*</span>
            </label>
            <select
              value={form.categoryId}
              onChange={(e) => { setForm((p) => ({ ...p, categoryId: e.target.value })); setErrors((p) => ({ ...p, categoryId: undefined })); }}
              className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:border-brand-gold transition-colors ${
                errors.categoryId ? 'border-red-400 bg-red-50' : 'border-slate-300'
              }`}
            >
              <option value="">Select category…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {errors.categoryId && <p className="mt-1 text-[11px] text-red-500">{errors.categoryId}</p>}
          </div>

          {/* Pricing */}
          <PriceFields
            mrp={form.mrp}
            price={form.price}
            onMrp={(v) => { setForm((p) => ({ ...p, mrp: v }));   setErrors((p) => ({ ...p, mrp: undefined })); }}
            onPrice={(v) => { setForm((p) => ({ ...p, price: v })); setErrors((p) => ({ ...p, price: undefined })); }}
            mrpError={errors.mrp}
            priceError={errors.price}
          />

          {/* Stock */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Stock <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              min="0"
              value={form.stock}
              onChange={(e) => { setForm((p) => ({ ...p, stock: e.target.value })); setErrors((p) => ({ ...p, stock: undefined })); }}
              className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:border-brand-gold transition-colors ${
                errors.stock ? 'border-red-400 bg-red-50' : 'border-slate-300'
              }`}
            />
            {errors.stock && <p className="mt-1 text-[11px] text-red-500">{errors.stock}</p>}
          </div>

          {/* Active toggle for edit */}
          {isEdit && (
            <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
              <div
                onClick={() => setForm((p) => ({ ...p, isActive: !p.isActive }))}
                className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer ${form.isActive ? 'bg-brand-gold' : 'bg-slate-300'}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${form.isActive ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </div>
              <span className="text-sm text-slate-700 font-medium">
                {form.isActive ? 'Active — visible in shop' : 'Inactive — hidden from shop'}
              </span>
            </label>
          )}

        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50 rounded-b-2xl">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <button
            type="submit"
            form="product-form"
            disabled={saving}
            onClick={handleSubmit}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              saving
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-brand-gold text-slate-900 hover:bg-brand-gold-dark shadow-sm hover:shadow-md active:scale-[0.98]'
            }`}
          >
            {saving && (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {stepLabel}
          </button>
        </div>

      </div>
    </div>
  );
}

// ── Products Page ──────────────────────────────────────────────────────────────

export default function ProductsPage() {
  const [products,   setProducts]   = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [modal,      setModal]      = useState<'new' | AdminProduct | null>(null);
  const [deleting,   setDeleting]   = useState<number | null>(null);

  useEffect(() => {
    Promise.all([fetchAdminProducts(), fetchAdminCategories()])
      .then(([p, c]) => { setProducts(p); setCategories(c); })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = (saved: AdminProduct) => {
    setProducts((prev) => {
      const idx = prev.findIndex((p) => p.id === saved.id);
      return idx >= 0
        ? prev.map((p) => (p.id === saved.id ? saved : p))
        : [saved, ...prev];
    });
    setModal(null);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Deactivate "${name}"?`)) return;
    setDeleting(id);
    try {
      await deleteAdminProduct(id);
      setProducts((prev) => prev.map((p) => p.id === id ? { ...p, isActive: false } : p));
      toast.success('Product deactivated');
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to deactivate');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Products</h1>
          <p className="text-sm text-slate-400 mt-0.5">{products.length} products total</p>
        </div>
        <Button size="sm" onClick={() => setModal('new')}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Product
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100">
                  {['Product', 'Category', 'MRP', 'Price', 'Discount', 'Stock', 'Status', ''].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const thumb = (p.images?.[0]) ?? p.imageUrl;
                  return (
                    <tr key={p.id} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {thumb ? (
                            <img src={thumb} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-amber-50 border border-slate-100 shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center border border-slate-100 shrink-0">
                              <span className="text-base">🏺</span>
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-slate-800 leading-tight">{p.name}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">{p.images?.length ?? 0} photo{(p.images?.length ?? 0) !== 1 ? 's' : ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-500">{p.category.name}</td>
                      <td className="px-5 py-3.5 text-slate-500 line-through text-xs">
                        ₹{Number(p.mrp).toLocaleString('en-IN')}
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-slate-900">
                        ₹{Number(p.price).toLocaleString('en-IN')}
                      </td>
                      <td className="px-5 py-3.5">
                        {Number(p.discountPercent) > 0 && (
                          <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                            {Math.round(Number(p.discountPercent))}% off
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`font-semibold ${p.stock <= 5 ? 'text-red-500' : 'text-slate-700'}`}>
                          {p.stock}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge label={p.isActive ? 'Active' : 'Inactive'} variant={p.isActive ? 'success' : 'neutral'} />
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setModal(p)}
                            className="text-xs font-semibold text-brand-gold hover:text-brand-gold-dark transition-colors"
                          >
                            Edit
                          </button>
                          {p.isActive && (
                            <button
                              onClick={() => handleDelete(p.id, p.name)}
                              disabled={deleting === p.id}
                              className="text-xs font-semibold text-red-400 hover:text-red-600 transition-colors disabled:opacity-40"
                            >
                              {deleting === p.id ? '…' : 'Off'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-5 py-16 text-center">
                      <p className="text-slate-400 text-sm">No products yet</p>
                      <button
                        onClick={() => setModal('new')}
                        className="mt-3 text-xs font-semibold text-brand-gold hover:underline"
                      >
                        Add your first product →
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal !== null && (
        <ProductModal
          product={modal === 'new' ? null : modal}
          categories={categories}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
