'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Star, Shield, Truck, RotateCcw, Leaf } from 'lucide-react';
import api from '../lib/api';
import ProductCard from '../components/product/ProductCard';

/* ─── Data ─────────────────────────────────────────────── */
const CATEGORIES = [
  {
    name: 'Copper Vessels',
    slug: 'copper-vessels',
    tagline: 'Ayurvedic drinking ware',
    bg: 'from-orange-900 to-orange-700',
    emoji: '🫗',
  },
  {
    name: 'Brass Items',
    slug: 'brass-items',
    tagline: 'Sacred home artifacts',
    bg: 'from-yellow-800 to-amber-600',
    emoji: '🔔',
  },
  {
    name: 'Clay Pots',
    slug: 'clay-pots',
    tagline: 'Traditional cookware',
    bg: 'from-stone-700 to-stone-500',
    emoji: '🏺',
  },
  {
    name: 'Incense & Diyas',
    slug: 'incense-diyas',
    tagline: 'Ritual & puja essentials',
    bg: 'from-brand-800 to-brand-600',
    emoji: '🪔',
  },
];

const TRUST = [
  { icon: Leaf,       label: 'Handcrafted',    sub: 'By skilled artisans' },
  { icon: Shield,     label: 'Authentic',       sub: 'Directly sourced' },
  { icon: Truck,      label: 'Free Shipping',   sub: 'Orders over ₹999' },
  { icon: RotateCcw,  label: '7-Day Returns',   sub: 'Hassle-free policy' },
];

const TESTIMONIALS = [
  {
    name: 'Priya Sharma',
    location: 'Mumbai',
    rating: 5,
    text: 'The copper water bottle has completely changed my morning routine. The quality is unlike anything I\'ve found elsewhere — solid, beautiful, and it truly improves the water\'s taste.',
    initials: 'PS',
  },
  {
    name: 'Ramesh Kumar',
    location: 'Bangalore',
    rating: 5,
    text: 'Authentic clay pots that remind me of my grandmother\'s kitchen. Food cooked in these tastes so much better. The craftsmanship is evident in every detail.',
    initials: 'RK',
  },
  {
    name: 'Anita Mehta',
    location: 'Delhi',
    rating: 5,
    text: 'Beautiful brass diyas for our puja room. The finish is stunning and they arrived perfectly packaged. Customer service was also excellent when I had a question.',
    initials: 'AM',
  },
];

/* ─── Sub-components ────────────────────────────────────── */
function ProductSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-brand-100 overflow-hidden">
      <div className="aspect-square skeleton" />
      <div className="p-4 space-y-2.5">
        <div className="skeleton h-3 w-1/3 rounded-full" />
        <div className="skeleton h-4 w-4/5 rounded-lg" />
        <div className="skeleton h-4 w-3/5 rounded-lg" />
        <div className="skeleton h-9 w-full rounded-xl mt-4" />
      </div>
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────── */
export default function HomePage() {
  const { data: featuredData, isLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => api.get('/products?featured=true&limit=8').then(r => r.data),
  });

  const { data: newData, isLoading: newLoading } = useQuery({
    queryKey: ['new-products'],
    queryFn: () => api.get('/products?limit=4&sort=createdAt&order=desc').then(r => r.data),
  });

  const featured = featuredData?.data ?? [];
  const newest  = newData?.data ?? [];

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-hero-gradient text-white">
        {/* Subtle dot-grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        {/* Warm glow orbs */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-brand-500 rounded-full blur-3xl opacity-20 pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-brand-400 rounded-full blur-3xl opacity-10 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36">
          <div className="max-w-2xl">
            <p className="text-brand-300 text-xs font-semibold uppercase tracking-[0.2em] mb-5">
              Ancient craft · Modern home
            </p>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight mb-6 text-balance">
              Vessels Crafted<br />
              <span className="text-transparent bg-clip-text"
                style={{ backgroundImage: 'linear-gradient(90deg, #efbd6d, #e89a32)' }}>
                for Centuries
              </span>
            </h1>
            <p className="text-brand-200 text-lg md:text-xl leading-relaxed mb-10 max-w-xl text-pretty">
              Handcrafted copper, brass, and clay ware — each piece carries the tradition of Indian artisans and the wisdom of Ayurveda.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/shop/products" className="btn-copper btn-lg">
                Shop Now <ArrowRight size={18} />
              </Link>
              <Link
                href="/shop/products?featured=true"
                className="btn btn-lg border border-white/25 text-white hover:bg-white/10 transition-colors"
              >
                View Featured
              </Link>
            </div>

            {/* Social proof strip */}
            <div className="mt-12 flex items-center gap-6 text-sm text-brand-300">
              <div className="flex -space-x-2">
                {['PS', 'RK', 'AM', 'VN'].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full bg-brand-600 border-2 border-brand-900 flex items-center justify-center text-[10px] font-bold text-white">
                    {i}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex gap-0.5 mb-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={12} className="fill-brand-400 text-brand-400" />
                  ))}
                </div>
                <span>Loved by <strong className="text-white">10,000+</strong> customers</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust bar ─────────────────────────────────────── */}
      <section className="bg-white border-b border-brand-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-0 md:divide-x divide-brand-100">
          {TRUST.map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex items-center gap-3 md:px-8 first:pl-0 last:pr-0">
              <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                <Icon size={17} className="text-brand-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-brand-900">{label}</p>
                <p className="text-xs text-brand-400">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Categories ────────────────────────────────────── */}
      <section className="section">
        <div className="text-center mb-12">
          <p className="section-subtitle">Browse by type</p>
          <h2 className="section-title">Explore Collections</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/shop/products?category=${cat.slug}`}
              className={`relative group rounded-2xl overflow-hidden bg-gradient-to-br ${cat.bg} aspect-[4/3] flex flex-col justify-end p-5 md:p-6`}
            >
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-300" />
              {/* Pattern */}
              <div
                className="absolute inset-0 opacity-[0.08]"
                style={{
                  backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                }}
              />
              <span className="text-4xl mb-3 relative block">{cat.emoji}</span>
              <div className="relative">
                <h3 className="text-white font-display font-semibold text-base md:text-lg leading-tight">{cat.name}</h3>
                <p className="text-white/70 text-xs mt-0.5">{cat.tagline}</p>
              </div>
              <ArrowRight size={16} className="absolute top-4 right-4 text-white/50 group-hover:text-white group-hover:translate-x-0.5 transition-all duration-200" />
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured Products ──────────────────────────────── */}
      <section className="bg-cream-200 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="section-subtitle">Hand-picked</p>
              <h2 className="section-title">Featured Products</h2>
            </div>
            <Link href="/shop/products?featured=true" className="btn-secondary hidden sm:inline-flex">
              View all <ArrowRight size={15} />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)
              : featured.length > 0
              ? featured.map((p: any) => <ProductCard key={p.id} product={p} />)
              : (
                <div className="col-span-full text-center py-16 text-brand-400">
                  <p className="text-lg mb-2">No featured products yet.</p>
                  <Link href="/shop/products" className="btn-primary">Browse All Products</Link>
                </div>
              )
            }
          </div>

          <div className="text-center mt-8 sm:hidden">
            <Link href="/shop/products?featured=true" className="btn-secondary inline-flex">
              View all <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Ayurveda CTA ──────────────────────────────────── */}
      <section className="section">
        <div className="relative overflow-hidden rounded-3xl bg-hero-gradient text-white px-8 py-14 md:py-20 md:px-16">
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />
          <div className="absolute -right-12 -top-12 w-72 h-72 bg-brand-500 rounded-full blur-3xl opacity-30" />
          <div className="relative max-w-xl">
            <p className="text-brand-300 text-xs font-semibold uppercase tracking-[0.18em] mb-4">Ayurveda wisdom</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold leading-tight mb-4 text-balance">
              Ancient Vessels for a Healthier Life
            </h2>
            <p className="text-brand-200 leading-relaxed mb-8">
              Ayurveda prescribes drinking water stored in copper vessels to balance the three doshas, improve digestion, and boost immunity. Our copper vessels follow centuries-old craft traditions.
            </p>
            <Link href="/shop/products?category=copper-vessels" className="btn-copper btn-lg inline-flex">
              Shop Copper Vessels <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Benefits ──────────────────────────────────────── */}
      <section className="bg-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="section-subtitle">Backed by Ayurveda</p>
            <h2 className="section-title mb-3">Why Copper & Brass?</h2>
            <p className="text-brand-500 max-w-xl mx-auto text-base leading-relaxed text-pretty">
              Ancient Indian wisdom, now validated by modern science. Here's why thousands are switching to traditional vessels.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: '💧',
                title: 'Natural Purification',
                desc: 'Copper ions leach into water stored overnight, killing harmful bacteria like E. coli and S. aureus — a natural purification process described in Ayurveda as "Tamra Jal".',
                tag: 'Scientifically proven',
              },
              {
                icon: '⚡',
                title: 'Boosts Immunity',
                desc: 'Copper is an essential trace mineral that supports the production of white blood cells, strengthening your immune system naturally with every sip.',
                tag: 'Ayurvedic wisdom',
              },
              {
                icon: '🔥',
                title: 'Improves Digestion',
                desc: 'Regular intake of copper-infused water stimulates digestive enzymes, reduces inflammation, and helps cleanse the stomach lining for better gut health.',
                tag: 'Dosha balancing',
              },
              {
                icon: '✨',
                title: 'Anti-Aging Properties',
                desc: 'Copper is rich in antioxidants that fight free radicals — the primary cause of skin aging. Traditional texts recommend copper vessels for a natural glow.',
                tag: 'Beauty & wellness',
              },
              {
                icon: '🧠',
                title: 'Brain Stimulant',
                desc: 'Copper helps synthesize phospholipids essential for myelin sheath formation, stimulating brain function and improving focus and mental clarity.',
                tag: 'Cognitive health',
              },
              {
                icon: '❤️',
                title: 'Heart Health',
                desc: 'Copper regulates blood pressure, lowers LDL (bad) cholesterol, and supports red blood cell production — all critical for a healthy cardiovascular system.',
                tag: 'Cardiovascular care',
              },
            ].map(({ icon, title, desc, tag }) => (
              <div key={title} className="card-hover p-6 md:p-7 flex flex-col gap-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center text-2xl flex-shrink-0">
                    {icon}
                  </div>
                  <span className="badge-copper mt-1">{tag}</span>
                </div>
                <div>
                  <h3 className="font-display font-semibold text-brand-900 text-lg mb-2">{title}</h3>
                  <p className="text-brand-500 text-sm leading-relaxed text-pretty">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-2xl bg-brand-50 border border-brand-100 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="font-display font-semibold text-brand-900 text-lg mb-1">Ready to experience the benefits?</p>
              <p className="text-brand-500 text-sm">Start with a copper bottle — the most impactful way to begin.</p>
            </div>
            <Link href="/shop/products?category=copper-vessels" className="btn-primary flex-shrink-0">
              Shop Copper Vessels <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── New Arrivals ───────────────────────────────────── */}
      {(newLoading || newest.length > 0) && (
        <section className="bg-white py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="section-subtitle">Just arrived</p>
                <h2 className="section-title">New Arrivals</h2>
              </div>
              <Link href="/shop/products?sort=createdAt&order=desc" className="btn-secondary hidden sm:inline-flex">
                View all <ArrowRight size={15} />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
              {newLoading
                ? Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)
                : newest.map((p: any) => <ProductCard key={p.id} product={p} />)
              }
            </div>
          </div>
        </section>
      )}

      {/* ── Testimonials ──────────────────────────────────── */}
      <section className="bg-cream-200 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="section-subtitle">Social proof</p>
            <h2 className="section-title">What Customers Say</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="card-hover p-6 md:p-7 flex flex-col gap-4">
                {/* Stars */}
                <div className="flex gap-1">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={14} className="fill-brand-400 text-brand-400" />
                  ))}
                </div>
                {/* Quote */}
                <p className="text-brand-700 text-sm leading-relaxed flex-1 text-pretty">
                  "{t.text}"
                </p>
                {/* Author */}
                <div className="flex items-center gap-3 pt-2 border-t border-brand-100">
                  <div className="w-9 h-9 rounded-full bg-brand-600 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-brand-900">{t.name}</p>
                    <p className="text-xs text-brand-400">{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ────────────────────────────────────── */}
      <section className="section text-center">
        <p className="section-subtitle">Start your journey</p>
        <h2 className="section-title mb-4">
          Bring Ancient Craft<br className="hidden sm:block" /> into Your Home
        </h2>
        <p className="text-brand-500 text-lg max-w-lg mx-auto mb-10 text-pretty">
          Join 10,000+ customers who've rediscovered the joy of traditional Indian pottery and metalware.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/shop/products" className="btn-copper btn-lg">
            Shop All Products <ArrowRight size={18} />
          </Link>
          <Link href="/auth/register" className="btn-secondary btn-lg">
            Create Free Account
          </Link>
        </div>
      </section>
    </>
  );
}
