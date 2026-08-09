'use client';

import { useLocale } from 'next-intl';

import { ProductCard } from '@/app/[locale]/(shop)/_lib/components/common/ProductCard';
import { SectionHeading } from '@/app/[locale]/(shop)/_lib/components/common/SectionHeading';
import { newArrivalsData } from '@/app/[locale]/(shop)/_lib/data/home';

export function SectionNewArrivals(): React.JSX.Element {
  const locale = useLocale();
  const [spotlight, ...rest] = newArrivalsData;
  const strip = rest.slice(0, 4);

  return (
    <section>
      <div className="container mx-auto px-4 py-(--space-section-new-arrivals) md:py-(--space-section-new-arrivals-lg)">
        <SectionHeading title="Hàng mới về" ctaLabel="Xem thêm" ctaHref={`/${locale}/products`} />
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-5 lg:gap-8">
          {spotlight != null ? (
            <div className="lg:col-span-3">
              <ProductCard
                id={spotlight.id}
                name={spotlight.name}
                slug={spotlight.slug}
                price={spotlight.price}
                salePrice={spotlight.salePrice}
                images={spotlight.images}
                rating={spotlight.rating}
                reviewCount={spotlight.reviewCount}
                badges={spotlight.badges}
                locale={locale}
              />
            </div>
          ) : null}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:col-span-2 lg:grid-cols-2">
            {strip.map((product) => (
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
      </div>
    </section>
  );
}
