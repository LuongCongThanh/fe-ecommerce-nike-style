'use client';

import { useLocale } from 'next-intl';

import { ProductCard } from '@/app/[locale]/(shop)/_lib/components/common/ProductCard';
import { SectionHeading } from '@/app/[locale]/(shop)/_lib/components/common/SectionHeading';
import { newArrivalsData } from '@/app/[locale]/(shop)/_lib/data/home';

export function SectionNewArrivals(): React.JSX.Element {
  const locale = useLocale();
  const newArrivals = newArrivalsData;

  return (
    <section className="bg-muted/50">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <SectionHeading title="Hàng mới về" ctaLabel="Xem thêm" ctaHref={`/${locale}/products`} />
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {newArrivals.map((product) => (
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
