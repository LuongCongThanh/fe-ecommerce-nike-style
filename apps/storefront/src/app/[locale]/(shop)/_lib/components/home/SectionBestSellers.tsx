'use client';

import { useLocale, useTranslations } from 'next-intl';

import { ProductCard } from '@/app/[locale]/(shop)/_lib/components/common/ProductCard';
import { ProductCarousel } from '@/app/[locale]/(shop)/_lib/components/common/ProductCarousel';
import { bestSellersData } from '@/app/[locale]/(shop)/_lib/data/home';

export function SectionBestSellers(): React.JSX.Element {
  const locale = useLocale();
  const t = useTranslations('home.bestSellers');
  const bestSellers = bestSellersData;

  return (
    <section className="container mx-auto px-4 py-(--space-section-best-sellers)">
      <ProductCarousel title={t('title')} ctaLabel={t('viewAll')} ctaHref={`/${locale}/products`}>
        {bestSellers.map((product) => (
          <div key={product.id} className="w-[45%] min-w-[45%] shrink-0 snap-start sm:w-[30%] sm:min-w-[30%] lg:w-[23%] lg:min-w-[23%]">
            <ProductCard
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
          </div>
        ))}
      </ProductCarousel>
    </section>
  );
}
