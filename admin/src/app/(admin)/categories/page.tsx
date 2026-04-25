'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { fetchAdminCategories, createAdminCategory, type AdminCategory } from '@/services/categories.service';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [newName,    setNewName]    = useState('');
  const [creating,   setCreating]   = useState(false);

  useEffect(() => {
    fetchAdminCategories()
      .then(setCategories)
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) { toast.error('Enter a category name'); return; }
    setCreating(true);
    try {
      const created = await createAdminCategory(newName.trim());
      setCategories((prev) => [...prev, { ...created, productCount: 0 }]);
      setNewName('');
      toast.success('Category created');
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to create category');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <h1 className="text-xl font-bold text-slate-800">Categories</h1>

      {/* Add form */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-sm font-semibold text-slate-800 mb-4">Add New Category</h2>
        <form onSubmit={handleCreate} className="flex gap-3">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Category name…"
            className="flex-1 px-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-brand-gold"
          />
          <Button type="submit" size="sm" disabled={creating}>
            {creating ? 'Creating…' : 'Add Category'}
          </Button>
        </form>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 bg-slate-100 rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['Category', 'Products', 'Status', 'Created'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {categories.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-slate-800">{c.name}</td>
                  <td className="px-5 py-3.5 text-slate-600">{c.productCount}</td>
                  <td className="px-5 py-3.5">
                    <Badge label={c.isActive ? 'Active' : 'Inactive'} variant={c.isActive ? 'success' : 'neutral'} />
                  </td>
                  <td className="px-5 py-3.5 text-slate-400 text-xs">
                    {new Date(c.createdAt).toLocaleDateString('en-IN')}
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-slate-400 text-sm">
                    No categories yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
