'use client';

import Link from 'next/link';
import { useState } from 'react';

const CATEGORIES = [
  { icon: '🙏', label: 'Puja Sets',       query: 'Puja+Sets'    },
  { icon: '🍶', label: 'Copper Bottles',  query: 'Copper'       },
  { icon: '🏺', label: 'Brass Vessels',   query: 'Vessels'      },
  { icon: '🪔', label: 'Diyas & Lamps',   query: 'Diyas'        },
  { icon: '🔔', label: 'Accessories',     query: 'Accessories'  },
  { icon: '🧿', label: 'Idols',           query: 'Idols'        },
  { icon: '🕉️', label: 'Incense',         query: 'Incense'      },
  { icon: '✨', label: 'Gift Sets',       query: 'Gifts'        },
];

const BASE  = 'flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap border-2 transition-all duration-200 shrink-0';
const ACTIVE = 'bg-brand-gold text-brand-charcoal border-brand-gold shadow-md ring-2 ring-brand-gold/20';
const IDLE   = 'bg-white text-gray-600 border-gray-200 hover:border-brand-gold hover:text-brand-gold hover:bg-amber-50 hover:shadow-sm';

export default function CategoryStrip() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <section className="bg-white border-b-2 border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div
          className="flex items-center gap-2.5 overflow-x-auto"
          style={{ scrollbarWidth: 'none' }}
        >
          {/* All button */}
          <button
            onClick={() => setActive(null)}
            className={`${BASE} ${active === null ? ACTIVE : IDLE}`}
          >
            All
          </button>

          {CATEGORIES.map((cat) => (
            <Link
              key={cat.query}
              href={`/shop?category=${cat.query}`}
              onClick={() => setActive(cat.query)}
              className={`${BASE} ${active === cat.query ? ACTIVE : IDLE}`}
            >
              <span className="text-base leading-none">{cat.icon}</span>
              {cat.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
