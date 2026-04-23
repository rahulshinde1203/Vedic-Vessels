import Link from 'next/link';

const footerLinks = {
  Shop: [
    { href: '/shop', label: 'All Products' },
    { href: '/shop?category=Puja+Sets', label: 'Puja Sets' },
    { href: '/shop?category=Vessels', label: 'Brass & Copper Vessels' },
    { href: '/shop?category=Diyas', label: 'Diyas & Lamps' },
  ],
  Company: [
    { href: '/about', label: 'About Us' },
    { href: '/contact', label: 'Contact' },
    { href: '/blog', label: 'Blog' },
  ],
  Support: [
    { href: '/faq', label: 'FAQ' },
    { href: '/shipping', label: 'Shipping Policy' },
    { href: '/returns', label: 'Returns' },
    { href: '/privacy', label: 'Privacy Policy' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-brand-charcoal text-brand-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-brand-gold text-xl">☽</span>
              <span className="font-serif text-lg">
                Vedic <span className="text-brand-gold">Vessels</span>
              </span>
            </div>
            <p className="text-sm text-brand-cream/60 leading-relaxed">
              Handcrafted sacred vessels and ritual items, made with devotion for your spiritual journey.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-serif text-brand-gold text-xs tracking-widest uppercase mb-4">
                {category}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-brand-cream/60 hover:text-brand-gold transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-brand-cream/10 mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-brand-cream/40">
            &copy; {new Date().getFullYear()} Vedic Vessels. All rights reserved.
          </p>
          <p className="text-xs text-brand-cream/40">
            Made with devotion in India
          </p>
        </div>
      </div>
    </footer>
  );
}
