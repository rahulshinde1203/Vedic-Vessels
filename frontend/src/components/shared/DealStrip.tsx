const DEALS = [
  { icon: '⚡', text: 'Flash Sale — Up to 40% Off' },
  { icon: '🚚', text: 'Free Delivery above ₹999'   },
  { icon: '💵', text: 'Cash on Delivery Available'  },
  { icon: '↩️', text: '7-Day Easy Returns'          },
];

export default function DealStrip() {
  return (
    <div className="bg-brand-charcoal overflow-hidden">
      <div
        className="flex items-center justify-center gap-0 h-9 overflow-x-auto"
        style={{ scrollbarWidth: 'none' }}
      >
        {DEALS.map((deal, i) => (
          <div key={deal.text} className="flex items-center shrink-0">
            <span className="flex items-center gap-1.5 text-[11px] text-white/85 font-medium whitespace-nowrap px-5">
              <span>{deal.icon}</span>
              {deal.text}
            </span>
            {i < DEALS.length - 1 && (
              <span className="text-white/20 text-sm select-none">|</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
