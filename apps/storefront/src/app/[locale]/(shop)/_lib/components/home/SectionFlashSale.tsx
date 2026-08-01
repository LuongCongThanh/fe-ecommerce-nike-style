'use client';

import { useLocale } from 'next-intl';

import { ProductCard } from '@/app/[locale]/(shop)/_lib/components/common/ProductCard';
import { CountdownTimer } from '@/app/[locale]/(shop)/_lib/components/home/CountdownTimer';
import { bestSellersData } from '@/app/[locale]/(shop)/_lib/data/home';
import { useHomeFlashSaleCountdown } from '@/app/[locale]/(shop)/_lib/hooks/home/useHomeFlashSaleCountdown';

export function SectionFlashSale(): React.JSX.Element {
  const locale = useLocale();
  const { targetDate } = useHomeFlashSaleCountdown();
  const flashSale = bestSellersData.slice(0, 4);

  return (
    <section className="bg-brand-50">
      <div className="container mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-brand-700 text-2xl font-semibold tracking-tight">Flash Sale</h2>
            <span className="bg-brand-600 rounded-full px-3 py-0.5 text-xs font-semibold text-white">Hôm nay thôi</span>
          </div>
          <CountdownTimer targetDate={targetDate} variant="compact" />
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
