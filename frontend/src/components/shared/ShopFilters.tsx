import Link from 'next/link';
import { CATEGORIES } from '@/constants';

interface Props {
  activeCategory: string | null;
}

const PILL =
  'flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border transition-all duration-200 shrink-0';
const ACTIVE = 'bg-brand-gold text-brand-charcoal border-brand-gold shadow-sm';
const IDLE   = 'bg-white text-gray-600 border-gray-200 hover:border-brand-gold hover:text-brand-gold hover:bg-amber-50';

export default function ShopFilters({ activeCategory }: Props) {
  return (
    <section className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>

          <Link href="/shop" className={`${PILL} ${activeCategory === null ? ACTIVE : IDLE}`}>
            All
          </Link>

          {CATEGORIES.map((cat) => (
            <Link
              key={cat.query}
              href={`/shop?category=${cat.query}`}
              className={`${PILL} ${activeCategory === cat.query ? ACTIVE : IDLE}`}
            >
              <span className="text-base leading-none">{cat.icon}</span>
              {cat.name}
            </Link>
          ))}

        </div>
      </div>
    </section>
  );
}
