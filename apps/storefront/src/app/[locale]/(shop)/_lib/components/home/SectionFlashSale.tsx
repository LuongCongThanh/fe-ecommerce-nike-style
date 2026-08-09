'use client';

import { useLocale } from 'next-intl';

import { ProductCard } from '@/app/[locale]/(shop)/_lib/components/common/ProductCard';
import { bestSellersData } from '@/app/[locale]/(shop)/_lib/data/home';

export function SectionFlashSale(): React.JSX.Element {
  const locale = useLocale();
  const flashSale = bestSellersData.slice(0, 4);

  return (
    <section className="bg-muted/50">
      <div className="container mx-auto px-4 py-(--space-section-flash-sale)">
        {/* Header — no countdown/urgency badge here: there is no real sale-end time behind it yet
            (homepage-improvement-plan.md P0-1). Re-add CountdownTimer once a real backend
            sale-end timestamp is available; do not fabricate a deadline. */}
        <div className="mb-6 flex items-center gap-3">
          <h2 className="text-foreground text-2xl font-semibold tracking-tight">Flash Sale</h2>
        </div>

        {/* Products */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {flashSale.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              slug={product.slug}
              price={product.price}
              salePrice={product.salePrice}
              images={product.images}
              rating={product.rating}
              reviewCount={product.reviewCount}
              badges={product.badges}
              locale={locale}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
