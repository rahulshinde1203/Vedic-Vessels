import HeroBanner from '@/components/shared/HeroBanner';
import CategoryStrip from '@/components/shared/CategoryStrip';
import DealStrip from '@/components/shared/DealStrip';
import ProductGrid from '@/components/shared/ProductGrid';

// ── Section divider ───────────────────────────────────────────────────────────

function SectionDivider() {
  return <div className="h-3 bg-gray-100" />;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="bg-gray-100 min-h-screen">

      <HeroBanner />
      <CategoryStrip />
      <DealStrip />

      <SectionDivider />

      <ProductGrid
        title="Trending Products"
        subtitle="Our most-reviewed picks this week"
        badge="HOT"
        badgeColor="orange"
      />

      <SectionDivider />

      <ProductGrid
        title="Best Deals"
        subtitle="Biggest discounts — limited stock"
        badge="SALE"
        badgeColor="red"
      />

      <SectionDivider />

      <ProductGrid
        title="Featured Products"
        subtitle="Highest-rated items by our customers"
        badge="TOP RATED"
        badgeColor="gold"
      />

      <SectionDivider />

    </div>
  );
}
