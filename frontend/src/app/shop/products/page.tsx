'use client';

import { useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  SlidersHorizontal, ChevronDown, X, ArrowUpDown,
  LayoutGrid, LayoutList, ChevronLeft, ChevronRight, Search,
} from 'lucide-react';
import api from '../../../lib/api';
import ProductCard from '../../../components/product/ProductCard';
import ProductListItem from '../../../components/product/ProductListItem';

/* ─── Constants ─────────────────────────────────────────── */
const CATEGORIES = [
  { label: 'All', value: '' },
  { label: 'Copper Vessels', value: 'copper-vessels' },
  { label: 'Brass Items', value: 'brass-items' },
  { label: 'Clay Pots', value: 'clay-pots' },
  { label: 'Incense & Diyas', value: 'incense-diyas' },
];

const MATERIALS = [
  { label: 'Copper', value: 'copper' },
  { label: 'Brass', value: 'brass' },
  { label: 'Clay', value: 'clay' },
  { label: 'Bronze', value: 'bronze' },
];

const SORT_OPTIONS = [
  { label: 'Newest first',    value: 'createdAt:desc' },
  { label: 'Price: Low → High', value: 'price:asc' },
  { label: 'Price: High → Low', value: 'price:desc' },
  { label: 'Name: A → Z',    value: 'name:asc' },
];

const PRICE_RANGES = [
  { label: 'Under ₹500',     min: 0,    max: 500 },
  { label: '₹500 – ₹1,000', min: 500,  max: 1000 },
  { label: '₹1,000 – ₹2,500', min: 1000, max: 2500 },
  { label: 'Above ₹2,500',  min: 2500, max: 999999 },
];

const LIMIT = 12;

/* ─── Skeleton ──────────────────────────────────────────── */
function GridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-brand-100 overflow-hidden">
          <div className="aspect-square skeleton" />
          <div className="p-4 space-y-2.5">
            <div className="skeleton h-3 w-1/3 rounded-full" />
            <div className="skeleton h-4 w-4/5 rounded-lg" />
            <div className="skeleton h-3 w-1/2 rounded-lg" />
            <div className="skeleton h-9 rounded-xl mt-3" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Active filter pill ────────────────────────────────── */
function FilterPill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-brand-100 text-brand-800 text-xs font-medium px-3 py-1.5 rounded-full">
      {label}
      <button onClick={onRemove} className="hover:text-brand-600">
        <X size={12} />
      </button>
    </span>
  );
}

/* ─── Sidebar ───────────────────────────────────────────── */
interface Filters {
  category: string;
  priceRange: number | null;
  material: string;
  featured: boolean;
}

function FilterSidebar({
  filters,
  onChange,
  onReset,
  activeCount,
}: {
  filters: Filters;
  onChange: (f: Partial<Filters>) => void;
  onReset: () => void;
  activeCount: number;
}) {
  return (
    <aside className="space-y-7">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-brand-600" />
          <span className="font-semibold text-brand-900 text-sm">Filters</span>
          {activeCount > 0 && (
            <span className="bg-brand-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button onClick={onReset} className="text-xs text-brand-400 hover:text-brand-700 transition-colors">
            Reset all
          </button>
        )}
      </div>

      {/* Category */}
      <div>
        <p className="text-xs font-semibold text-brand-400 uppercase tracking-widest mb-3">Category</p>
        <div className="space-y-1">
          {CATEGORIES.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => onChange({ category: value })}
              className={`w-full text-left text-sm px-3 py-2 rounded-xl transition-colors ${
                filters.category === value
                  ? 'bg-brand-600 text-white font-medium'
                  : 'text-brand-700 hover:bg-brand-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div>
        <p className="text-xs font-semibold text-brand-400 uppercase tracking-widest mb-3">Price Range</p>
        <div className="space-y-1">
          {PRICE_RANGES.map(({ label }, i) => (
            <button
              key={label}
              onClick={() => onChange({ priceRange: filters.priceRange === i ? null : i })}
              className={`w-full text-left text-sm px-3 py-2 rounded-xl transition-colors flex items-center gap-2 ${
                filters.priceRange === i
                  ? 'bg-brand-100 text-brand-800 font-medium'
                  : 'text-brand-700 hover:bg-brand-50'
              }`}
            >
              <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                filters.priceRange === i ? 'border-brand-600' : 'border-brand-200'
              }`}>
                {filters.priceRange === i && (
                  <span className="w-2 h-2 rounded-full bg-brand-600 block" />
                )}
              </span>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Material */}
      <div>
        <p className="text-xs font-semibold text-brand-400 uppercase tracking-widest mb-3">Material</p>
        <div className="flex flex-wrap gap-2">
          {MATERIALS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => onChange({ material: filters.material === value ? '' : value })}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                filters.material === value
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'border-brand-200 text-brand-600 hover:border-brand-400'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Featured toggle */}
      <div>
        <p className="text-xs font-semibold text-brand-400 uppercase tracking-widest mb-3">Availability</p>
        <button
          onClick={() => onChange({ featured: !filters.featured })}
          className={`w-full text-left text-sm px-3 py-2 rounded-xl transition-colors flex items-center justify-between ${
            filters.featured ? 'bg-brand-100 text-brand-800 font-medium' : 'text-brand-700 hover:bg-brand-50'
          }`}
        >
          Featured only
          <span className={`w-8 h-4 rounded-full transition-colors relative ${filters.featured ? 'bg-brand-600' : 'bg-brand-200'}`}>
            <span className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-all ${filters.featured ? 'left-4' : 'left-0.5'}`} />
          </span>
        </button>
      </div>
    </aside>
  );
}

/* ─── Pagination ────────────────────────────────────────── */
function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages: (number | '…')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push('…');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push('…');
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-center gap-1.5 mt-12">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="btn-secondary btn-icon disabled:opacity-40"
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`ellipsis-${i}`} className="px-2 text-brand-400 text-sm select-none">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p as number)}
            className={`w-9 h-9 rounded-xl text-sm font-medium transition-colors ${
              page === p
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-brand-700 hover:bg-brand-100'
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className="btn-secondary btn-icon disabled:opacity-40"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

/* ─── Main page ─────────────────────────────────────────── */
function ProductsContent() {
  const router   = useRouter();
  const pathname = usePathname();
  const params   = useSearchParams();

  // State from URL
  const [page,    setPage]   = useState(Number(params.get('page') || 1));
  const [search,  setSearch] = useState(params.get('search') || '');
  const [searchInput, setSearchInput] = useState(params.get('search') || '');
  const [sort,    setSort]   = useState(params.get('sort') || 'createdAt:desc');
  const [view,    setView]   = useState<'grid' | 'list'>('grid');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const [filters, setFilters] = useState<Filters>({
    category:   params.get('category') || '',
    priceRange: null,
    material:   '',
    featured:   params.get('featured') === 'true',
  });

  // Sync URL when filters/sort/page change
  const syncUrl = useCallback((overrides: Partial<{ page: number; search: string; sort: string; filters: Filters }> = {}) => {
    const f = overrides.filters ?? filters;
    const s = overrides.search  ?? search;
    const p = overrides.page    ?? 1;
    const o = overrides.sort    ?? sort;
    const q = new URLSearchParams();
    if (f.category) q.set('category', f.category);
    if (s)          q.set('search',   s);
    if (f.featured) q.set('featured', 'true');
    if (p > 1)      q.set('page',     String(p));
    if (o !== 'createdAt:desc') q.set('sort', o);
    router.push(`${pathname}?${q.toString()}`, { scroll: false });
  }, [filters, search, sort, page, router, pathname]);

  const handleFilterChange = (partial: Partial<Filters>) => {
    const next = { ...filters, ...partial };
    setFilters(next);
    setPage(1);
    syncUrl({ filters: next, page: 1 });
  };

  const handleReset = () => {
    const reset: Filters = { category: '', priceRange: null, material: '', featured: false };
    setFilters(reset);
    setSearch('');
    setSearchInput('');
    setPage(1);
    syncUrl({ filters: reset, search: '', page: 1 });
  };

  const handleSort = (val: string) => {
    setSort(val);
    setSortOpen(false);
    setPage(1);
    syncUrl({ sort: val, page: 1 });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
    syncUrl({ search: searchInput, page: 1 });
  };

  const handlePage = (p: number) => {
    setPage(p);
    syncUrl({ page: p });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Build API params
  const [sortField, sortOrder] = sort.split(':');
  const priceFilter = filters.priceRange !== null ? PRICE_RANGES[filters.priceRange] : null;

  const queryKey = ['products', { filters, search, sort, page }];
  const { data, isLoading, isFetching } = useQuery({
    queryKey,
    queryFn: () =>
      api.get('/products', {
        params: {
          category: filters.category || undefined,
          search:   search || undefined,
          featured: filters.featured || undefined,
          sort:     sortField,
          order:    sortOrder,
          page,
          limit:    LIMIT,
        },
      }).then(r => r.data),
    placeholderData: (prev) => prev,
  });

  const products   = data?.data ?? [];
  const total      = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.totalPages ?? 1;

  // Client-side price filter (backend can be extended later)
  const visible = priceFilter
    ? products.filter((p: any) => Number(p.price) >= priceFilter.min && Number(p.price) <= priceFilter.max)
    : products;

  // Active filter count
  const activeCount =
    (filters.category ? 1 : 0) +
    (filters.priceRange !== null ? 1 : 0) +
    (filters.material ? 1 : 0) +
    (filters.featured ? 1 : 0) +
    (search ? 1 : 0);

  const sortLabel = SORT_OPTIONS.find(o => o.value === sort)?.label ?? 'Sort';

  return (
    <div className="min-h-screen bg-cream-100">
      {/* ── Page header ── */}
      <div className="bg-white border-b border-brand-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-brand-950 mb-1">
            {filters.category
              ? CATEGORIES.find(c => c.value === filters.category)?.label ?? 'Products'
              : 'All Products'}
          </h1>
          <p className="text-brand-400 text-sm">
            {isLoading ? 'Loading…' : `${total.toLocaleString()} product${total !== 1 ? 's' : ''} found`}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ── Toolbar ── */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 min-w-[200px] max-w-sm relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-400 pointer-events-none" />
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search products…"
              className="input pl-9 pr-4 py-2 text-sm h-9"
            />
          </form>

          {/* Mobile filter button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="btn-secondary btn-sm lg:hidden flex items-center gap-2"
          >
            <SlidersHorizontal size={15} />
            Filters
            {activeCount > 0 && (
              <span className="bg-brand-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{activeCount}</span>
            )}
          </button>

          {/* Spacer */}
          <div className="flex-1" />

          {/* View toggle */}
          <div className="hidden sm:flex items-center bg-brand-50 border border-brand-100 rounded-xl p-1 gap-1">
            <button
              onClick={() => setView('grid')}
              className={`p-1.5 rounded-lg transition-colors ${view === 'grid' ? 'bg-white shadow-sm text-brand-700' : 'text-brand-400 hover:text-brand-600'}`}
              title="Grid view"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-1.5 rounded-lg transition-colors ${view === 'list' ? 'bg-white shadow-sm text-brand-700' : 'text-brand-400 hover:text-brand-600'}`}
              title="List view"
            >
              <LayoutList size={15} />
            </button>
          </div>

          {/* Sort dropdown */}
          <div className="relative">
            <button
              onClick={() => setSortOpen(v => !v)}
              className="btn-secondary btn-sm flex items-center gap-2 min-w-[160px] justify-between"
            >
              <span className="flex items-center gap-1.5 text-brand-700">
                <ArrowUpDown size={13} />
                {sortLabel}
              </span>
              <ChevronDown size={13} className={`text-brand-400 transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
            </button>
            {sortOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
                <div className="absolute right-0 top-full mt-1 z-20 bg-white rounded-2xl shadow-card-hover border border-brand-100 p-1.5 w-52 animate-slide-down">
                  {SORT_OPTIONS.map(({ label, value }) => (
                    <button
                      key={value}
                      onClick={() => handleSort(value)}
                      className={`w-full text-left text-sm px-3 py-2.5 rounded-xl transition-colors ${
                        sort === value
                          ? 'bg-brand-50 text-brand-800 font-medium'
                          : 'text-brand-600 hover:bg-brand-50'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Active filter pills ── */}
        {activeCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {search && <FilterPill label={`"${search}"`} onRemove={() => { setSearch(''); setSearchInput(''); syncUrl({ search: '' }); }} />}
            {filters.category && <FilterPill label={CATEGORIES.find(c => c.value === filters.category)?.label ?? ''} onRemove={() => handleFilterChange({ category: '' })} />}
            {filters.priceRange !== null && <FilterPill label={PRICE_RANGES[filters.priceRange].label} onRemove={() => handleFilterChange({ priceRange: null })} />}
            {filters.material && <FilterPill label={filters.material.charAt(0).toUpperCase() + filters.material.slice(1)} onRemove={() => handleFilterChange({ material: '' })} />}
            {filters.featured && <FilterPill label="Featured only" onRemove={() => handleFilterChange({ featured: false })} />}
            <button onClick={handleReset} className="text-xs text-brand-400 hover:text-brand-700 underline underline-offset-2 transition-colors ml-1">
              Clear all
            </button>
          </div>
        )}

        {/* ── Layout: sidebar + grid ── */}
        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <div className="hidden lg:block w-56 flex-shrink-0">
            <div className="sticky top-24 bg-white rounded-2xl border border-brand-100 shadow-card p-5">
              <FilterSidebar
                filters={filters}
                onChange={handleFilterChange}
                onReset={handleReset}
                activeCount={activeCount}
              />
            </div>
          </div>

          {/* Product area */}
          <div className="flex-1 min-w-0">
            {/* Fade overlay when refetching */}
            <div className={`transition-opacity duration-200 ${isFetching && !isLoading ? 'opacity-60 pointer-events-none' : 'opacity-100'}`}>
              {isLoading ? (
                <GridSkeleton count={LIMIT} />
              ) : visible.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="text-5xl mb-4">🔍</div>
                  <h3 className="font-display text-xl font-semibold text-brand-900 mb-2">No products found</h3>
                  <p className="text-brand-400 text-sm mb-6 max-w-xs">
                    Try adjusting your filters or search term.
                  </p>
                  <button onClick={handleReset} className="btn-primary">Clear all filters</button>
                </div>
              ) : view === 'grid' ? (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                  {visible.map((p: any) => <ProductCard key={p.id} product={p} />)}
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {visible.map((p: any) => <ProductListItem key={p.id} product={p} />)}
                </div>
              )}
            </div>

            <Pagination page={page} totalPages={totalPages} onChange={handlePage} />
          </div>
        </div>
      </div>

      {/* ── Mobile filter drawer ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-white shadow-xl flex flex-col animate-slide-down">
            <div className="flex items-center justify-between px-5 py-4 border-b border-brand-100">
              <span className="font-semibold text-brand-900">Filters</span>
              <button onClick={() => setSidebarOpen(false)} className="btn-ghost btn-icon">
                <X size={18} />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-5">
              <FilterSidebar
                filters={filters}
                onChange={(f) => { handleFilterChange(f); }}
                onReset={() => { handleReset(); setSidebarOpen(false); }}
                activeCount={activeCount}
              />
            </div>
            <div className="px-5 py-4 border-t border-brand-100">
              <button
                onClick={() => setSidebarOpen(false)}
                className="btn-primary w-full justify-center"
              >
                View {total} products
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream-100"><GridSkeleton /></div>}>
      <ProductsContent />
    </Suspense>
  );
}
