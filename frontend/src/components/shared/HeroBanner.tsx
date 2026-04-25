import Link from 'next/link';

export default function HeroBanner() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #FFF8E0 0%, #FFE89A 55%, #FFD060 100%)' }}
    >
      {/* Decorative blobs */}
      <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-amber-300/20 pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-64 h-64 rounded-full bg-orange-200/15 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 md:py-10">
        <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">

          {/* ── Left: text ──────────────────────────────────────── */}
          <div className="flex-1 text-center md:text-left">

            {/* Badge */}
            <span className="inline-flex items-center gap-1.5 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-5 uppercase tracking-wider shadow-sm">
              🎉 Festive Sale — Limited Time
            </span>

            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight mb-4">
              Up to{' '}
              <span className="text-brand-copper">40% Off</span>
              <br />
              on Copper &amp; Brass Items
            </h1>

            <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-8 max-w-sm mx-auto md:mx-0">
              Handcrafted ritual items made by traditional artisans — delivered to your door.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-brand-gold hover:bg-brand-gold-dark active:scale-[0.97] text-brand-charcoal text-sm font-bold rounded-md shadow-md hover:shadow-lg transition-all duration-200"
              >
                Shop Now
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/shop"
                className="inline-flex items-center justify-center px-8 py-3 bg-white/70 hover:bg-white text-gray-800 text-sm font-semibold rounded-md border border-gray-300/60 transition-colors duration-200"
              >
                View All Offers
              </Link>
            </div>

            {/* Trust row */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-7 justify-center md:justify-start">
              {[
                { icon: '🚚', text: 'Free delivery above ₹999' },
                { icon: '✅', text: 'Authentic & handcrafted'  },
                { icon: '↩️', text: '7-day easy returns'       },
              ].map((t) => (
                <span key={t.text} className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                  <span>{t.icon}</span>
                  <span>{t.text}</span>
                </span>
              ))}
            </div>
          </div>

          {/* ── Right: single featured product card ─────────────── */}
          <div className="hidden md:flex shrink-0">
            <div className="relative bg-white rounded-2xl p-5 shadow-xl w-52 text-center">

              {/* Hot deal pill */}
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[10px] font-bold px-3.5 py-1 rounded-full whitespace-nowrap shadow">
                🔥 Hot Deal
              </span>

              {/* Product image */}
              <div className="w-full aspect-square bg-amber-50 rounded-xl flex items-center justify-center text-7xl mt-2 mb-3">
                🏺
              </div>

              <div className="text-sm font-bold text-gray-900 mb-1">Copper Kalash</div>

              <div className="flex items-baseline justify-center gap-2 mb-0.5">
                <span className="text-base font-bold text-gray-900">₹899</span>
                <span className="text-xs text-gray-400 line-through">₹1,099</span>
              </div>

              <span className="text-xs font-bold text-green-600">18% OFF</span>

              <Link
                href="/shop"
                className="mt-3 flex items-center justify-center w-full py-2 bg-brand-gold hover:bg-brand-gold-dark text-brand-charcoal text-xs font-bold rounded-lg transition-colors duration-200"
              >
                Add to Cart
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
