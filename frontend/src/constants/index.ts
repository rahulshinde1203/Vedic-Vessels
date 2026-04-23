import type { Product } from '@/types';

export const APP_NAME = 'Vedic Vessels';
export const APP_TAGLINE = 'Sacred Vessels for Sacred Rituals';

export const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
] as const;

export const PLACEHOLDER_PRODUCTS: Product[] = [
  { id: '1', name: 'Brass Puja Thali',         price: 1299, category: 'Puja Sets',   slug: 'brass-puja-thali',          inStock: true  },
  { id: '2', name: 'Copper Kalash',             price: 899,  category: 'Vessels',     slug: 'copper-kalash',             inStock: true  },
  { id: '3', name: 'Silver Diya Set',           price: 2499, category: 'Diyas',       slug: 'silver-diya-set',           inStock: true  },
  { id: '4', name: 'Brass Incense Holder',      price: 599,  category: 'Accessories', slug: 'brass-incense-holder',      inStock: true  },
  { id: '5', name: 'Copper Lota',               price: 749,  category: 'Vessels',     slug: 'copper-lota',               inStock: false },
  { id: '6', name: 'Brass Bell (Ghanta)',        price: 1099, category: 'Accessories', slug: 'brass-bell-ghanta',         inStock: true  },
  { id: '7', name: 'Terracotta Diyas (Set of 12)', price: 349, category: 'Diyas',     slug: 'terracotta-diyas-12',       inStock: true  },
  { id: '8', name: 'Agarbatti Stand',           price: 449,  category: 'Accessories', slug: 'agarbatti-stand',           inStock: true  },
];
