'use client';

import { useLocale } from 'next-intl';

import { ProductCard } from '@/app/[locale]/(shop)/_lib/components/common/ProductCard';
import { SectionHeading } from '@/app/[locale]/(shop)/_lib/components/common/SectionHeading';
import { bestSellersData } from '@/app/[locale]/(shop)/_lib/data/home';

export function SectionBestSellers(): React.JSX.Element {
  const locale = useLocale();
  const bestSellers = bestSellersData;

  return (
    <section className="container mx-auto px-4 py-12">
      <SectionHeading title="Sản phẩm bán chạy" ctaLabel="Xem tất cả" ctaHref={`/${locale}/products`} />
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {bestSellers.map((product) => (
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
    </section>
  );
}
