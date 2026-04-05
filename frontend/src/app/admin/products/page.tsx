'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus, Search, Pencil, Trash2, X,
  ChevronLeft, ChevronRight, PackageX, ToggleLeft, ToggleRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../lib/api';

/* ─── Types ─────────────────────────────────────────────── */
interface Product {
  id: string; name: string; slug: string; sku: string;
  price: number; comparePrice?: number; stock: number;
  isActive: boolean; isFeatured: boolean; images: string[];
  category: { id: string; name: string };
}

interface Category { id: string; name: string }

/* ─── Form modal ─────────────────────────────────────────── */
const EMPTY_FORM = {
  name: '', description: '', price: '', comparePrice: '',
  stock: '', sku: '', categoryId: '', isFeatured: false,
};

function ProductModal({
  product,
  categories,
  onClose,
  onSaved,
}: {
  product?: Product | null;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState(product ? {
    name: product.name,
    description: (product as any).description ?? '',
    price: String(product.price),
    comparePrice: product.comparePrice ? String(product.comparePrice) : '',
    stock: String(product.stock),
    sku: product.sku,
    categoryId: product.category.id,
    isFeatured: product.isFeatured,
  } : EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.sku || !form.categoryId) {
      toast.error('Fill in all required fields');
      return;
    }
    setSaving(true);
    try {
      const body = {
        ...form,
        price: Number(form.price),
        comparePrice: form.comparePrice ? Number(form.comparePrice) : undefined,
        stock: Number(form.stock),
        images: (product as any)?.images ?? [],
      };
      if (product) {
        await api.put(`/products/${product.id}`, body);
        toast.success('Product updated');
      } else {
        await api.post('/products', body);
        toast.success('Product created');
      }
      onSaved();
    } catch {
      toast.error('Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const field = (label: string, key: string, props: any = {}) => (
    <div>
      <label className="label">{label}{props.required !== false && <span className="text-red-400 ml-0.5">*</span>}</label>
      <input
        className="input text-sm"
        value={(form as any)[key]}
        onChange={e => set(key, e.target.value)}
        {...props}
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-display font-bold text-gray-900">{product ? 'Edit Product' : 'New Product'}</h2>
          <button onClick={onClose} className="btn-ghost btn-icon text-gray-400"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-6 space-y-4">
          {field('Product Name', 'name', { placeholder: 'e.g. Copper Water Bottle' })}

          <div>
            <label className="label">Description</label>
            <textarea
              className="input text-sm resize-none"
              rows={3}
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Brief product description…"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {field('Price (₹)', 'price', { type: 'number', min: 0, placeholder: '499' })}
            {field('Compare Price (₹)', 'comparePrice', { type: 'number', min: 0, placeholder: '699', required: false })}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {field('Stock', 'stock', { type: 'number', min: 0, placeholder: '50' })}
            {field('SKU', 'sku', { placeholder: 'VV-COP-001' })}
          </div>

          <div>
            <label className="label">Category<span className="text-red-400 ml-0.5">*</span></label>
            <select
              className="input text-sm"
              value={form.categoryId}
              onChange={e => set('categoryId', e.target.value)}
            >
              <option value="">Select category…</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <button
              type="button"
              onClick={() => set('isFeatured', !form.isFeatured)}
              className={`transition-colors ${form.isFeatured ? 'text-brand-600' : 'text-gray-300'}`}
            >
              {form.isFeatured ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
            </button>
            <span className="text-sm font-medium text-gray-700">Featured product</span>
          </label>
        </form>

        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end">
          <button onClick={onClose} className="btn-secondary btn-sm">Cancel</button>
          <button
            onClick={handleSubmit as any}
            disabled={saving}
            className="btn-primary btn-sm"
          >
            {saving ? 'Saving…' : product ? 'Save Changes' : 'Create Product'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────── */
export default function AdminProducts() {
  const queryClient = useQueryClient();
  const [search,   setSearch]   = useState('');
  const [page,     setPage]     = useState(1);
  const [modal,    setModal]    = useState<'new' | Product | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const LIMIT = 15;

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['admin-products', search, page],
    queryFn: () => api.get('/products', { params: { search: search || undefined, page, limit: LIMIT, sort: 'createdAt', order: 'desc' } }).then(r => r.data),
  });

  const { data: catData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then(r => r.data.data),
  });

  const deleteProduct = useMutation({
    mutationFn: (id: string) => api.delete(`/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Product deactivated');
      setDeleting(null);
    },
    onError: () => toast.error('Failed to delete'),
  });

  const products: Product[] = productsData?.data ?? [];
  const total      = productsData?.meta?.total ?? 0;
  const totalPages = productsData?.meta?.totalPages ?? 1;
  const categories: Category[] = catData ?? [];

  return (
    <div className="p-6 md:p-8">

      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-gray-900">Products</h1>
          <p className="text-sm text-gray-400 mt-0.5">{total} total products</p>
        </div>
        <button onClick={() => setModal('new')} className="btn-primary gap-2">
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden mb-6">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
          <Search size={15} className="text-gray-400 flex-shrink-0" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search products by name…"
            className="flex-1 text-sm outline-none text-gray-700 placeholder:text-gray-300 bg-transparent"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-gray-300 hover:text-gray-500 transition-colors">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="skeleton h-4 rounded-lg" style={{ width: `${60 + j * 5}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-gray-400">
                    <PackageX size={32} className="mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No products found</p>
                  </td>
                </tr>
              ) : (
                products.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    {/* Product */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 overflow-hidden flex-shrink-0 relative">
                          {p.images?.[0] ? (
                            <Image src={p.images[0]} alt={p.name} fill className="object-cover" sizes="40px" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-lg">🏺</div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate max-w-[180px]">{p.name}</p>
                          <p className="text-xs text-gray-400 font-mono">{p.sku}</p>
                        </div>
                      </div>
                    </td>
                    {/* Category */}
                    <td className="px-5 py-3.5 text-gray-600">{p.category?.name}</td>
                    {/* Price */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <p className="font-semibold text-gray-900">₹{Number(p.price).toLocaleString('en-IN')}</p>
                      {p.comparePrice && (
                        <p className="text-xs text-gray-400 line-through">₹{Number(p.comparePrice).toLocaleString('en-IN')}</p>
                      )}
                    </td>
                    {/* Stock */}
                    <td className="px-5 py-3.5">
                      <span className={`font-semibold ${p.stock === 0 ? 'text-red-500' : p.stock <= 5 ? 'text-amber-600' : 'text-gray-900'}`}>
                        {p.stock}
                      </span>
                    </td>
                    {/* Status */}
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium border ${p.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                          {p.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {p.isFeatured && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                            Featured
                          </span>
                        )}
                      </div>
                    </td>
                    {/* Actions */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setModal(p)}
                          className="p-2 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        {deleting === p.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => deleteProduct.mutate(p.id)}
                              className="px-2 py-1 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                              Confirm
                            </button>
                            <button onClick={() => setDeleting(null)} className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700">
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleting(p.id)}
                            className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-400">
              Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary btn-icon disabled:opacity-40"
              >
                <ChevronLeft size={15} />
              </button>
              <span className="px-3 text-sm text-gray-600">{page} / {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn-secondary btn-icon disabled:opacity-40"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <ProductModal
          product={modal === 'new' ? null : modal}
          categories={categories}
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null);
            queryClient.invalidateQueries({ queryKey: ['admin-products'] });
          }}
        />
      )}
    </div>
  );
}
