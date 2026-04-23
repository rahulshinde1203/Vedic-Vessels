import Link from 'next/link';
import Button from '@/components/ui/Button';
import ProductCard from '@/components/ui/ProductCard';
import { PLACEHOLDER_PRODUCTS } from '@/constants';

// ── Hero ─────────────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Warm dark gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#12090A] via-[#1E140A] to-brand-charcoal" />

      {/* Decorative concentric rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <div className="w-72 h-72 md:w-[26rem] md:h-[26rem] rounded-full border border-brand-gold opacity-10" />
        <div className="absolute w-96 h-96 md:w-[36rem] md:h-[36rem] rounded-full border border-brand-gold opacity-[0.06]" />
        <div className="absolute w-[30rem] h-[30rem] md:w-[46rem] md:h-[46rem] rounded-full border border-brand-gold opacity-[0.04]" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="h-px w-10 bg-brand-gold opacity-60" />
          <span className="text-brand-gold text-[10px] tracking-[0.35em] uppercase font-medium">
            Est. 2020 &middot; Handcrafted in India
          </span>
          <div className="h-px w-10 bg-brand-gold opacity-60" />
        </div>

        <h1 className="font-serif text-5xl md:text-7xl text-white leading-[1.1] mb-6">
          Sacred Vessels<br />
          <span className="text-brand-gold">for Sacred Rituals</span>
        </h1>

        <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-light">
          Handcrafted with devotion — brass, copper, and silver ritual items that elevate your spiritual practice.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/shop">
            <Button size="lg">Shop Collection</Button>
          </Link>
          <Link href="/about">
            <Button variant="outline" size="lg">Our Story</Button>
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="text-brand-gold/40 text-[10px] tracking-[0.3em] uppercase">Scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-brand-gold/40 to-transparent" />
      </div>
    </section>
  );
}

// ── Categories ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { icon: '🪔', name: 'Diyas & Lamps', count: '24 items', query: 'Diyas'       },
  { icon: '🏺', name: 'Brass Vessels', count: '18 items', query: 'Vessels'     },
  { icon: '🙏', name: 'Puja Sets',     count: '12 items', query: 'Puja+Sets'   },
  { icon: '🔔', name: 'Accessories',   count: '30 items', query: 'Accessories' },
];

function CategoriesSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="section-heading text-center md:text-4xl">Explore Our Collection</h2>
          <div className="gold-divider" />
          <p className="text-brand-brown max-w-lg mx-auto text-sm leading-relaxed">
            Curated categories of handcrafted ritual items, each made with the finest materials.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              href={`/shop?category=${cat.query}`}
              className="group flex flex-col items-center gap-3 p-8 border border-brand-cream-dark rounded-sm hover:border-brand-gold/50 hover:bg-brand-cream transition-all duration-300"
            >
              <span className="text-4xl group-hover:scale-110 transition-transform duration-300">
                {cat.icon}
              </span>
              <span className="font-serif text-brand-charcoal text-sm group-hover:text-brand-gold transition-colors">
                {cat.name}
              </span>
              <span className="text-[11px] text-brand-brown">{cat.count}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Featured Products ─────────────────────────────────────────────────────────

function FeaturedProducts() {
  return (
    <section className="py-20 bg-brand-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="section-heading text-center md:text-4xl">Featured Products</h2>
          <div className="gold-divider" />
          <p className="text-brand-brown max-w-lg mx-auto text-sm leading-relaxed">
            Our most loved ritual items — each piece tells a story of devotion and craftsmanship.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {PLACEHOLDER_PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/shop">
            <Button variant="outline" size="lg">View All Products</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

// ── Why Us ────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: '🌿',
    title: 'Pure Materials',
    body: 'Authentic brass, copper, and silver sourced directly from traditional artisans across India.',
  },
  {
    icon: '🙏',
    title: 'Sacred Craftsmanship',
    body: 'Each vessel is crafted following Vedic traditions by artisans with decades of hereditary expertise.',
  },
  {
    icon: '📦',
    title: 'Safe Delivery',
    body: 'Carefully packaged and insured delivery across India. Free shipping on orders above ₹999.',
  },
];

function WhyUsSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="section-heading text-center md:text-4xl">Why Vedic Vessels</h2>
          <div className="gold-divider" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {FEATURES.map((f) => (
            <div key={f.title} className="text-center px-4">
              <div className="text-5xl mb-5">{f.icon}</div>
              <h3 className="font-serif text-xl text-brand-charcoal mb-3">{f.title}</h3>
              <p className="text-brand-brown text-sm leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── CTA Banner ────────────────────────────────────────────────────────────────

function CtaBanner() {
  return (
    <section className="py-24 bg-brand-charcoal">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <div className="h-px w-14 bg-brand-gold/50 mx-auto mb-8" />
        <h2 className="font-serif text-3xl md:text-4xl text-white mb-4 leading-snug">
          Begin Your Sacred Journey
        </h2>
        <p className="text-white/50 mb-8 text-sm leading-relaxed max-w-md mx-auto">
          Explore our curated collection of sacred vessels. Every purchase supports traditional Indian artisans.
        </p>
        <Link href="/shop">
          <Button size="lg">Shop All Products</Button>
        </Link>
      </div>
    </section>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CategoriesSection />
      <FeaturedProducts />
      <WhyUsSection />
      <CtaBanner />
    </>
  );
}
