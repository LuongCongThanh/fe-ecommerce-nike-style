'use client';

import { useQuery } from '@tanstack/react-query';
import { useLocale, useTranslations } from 'next-intl';

import { ProductCard } from '@/features/catalog/components/ProductCard';
import { catalogKeys } from '@/features/catalog/queries/catalogKeys';
import { getProducts } from '@/lib/api/endpoints/catalog';
import type { ProductQuery, ProductSummary } from '@/lib/api/models/catalog';
import { Reveal } from '@/shared/ui/Reveal';
import { SectionHeading } from '@/shared/ui/SectionHeading';

const NEWEST: ProductQuery = { sort: 'newest', limit: 5 };

function NewArrivalCard({ product, locale }: { readonly product: ProductSummary; readonly locale: string }): React.JSX.Element {
  return (
    <ProductCard
      id={product.id}
      name={product.name}
      slug={product.slug}
      price={product.minPrice}
      images={product.imageUrl === null ? [] : [product.imageUrl]}
      isPriceRange={product.minPrice !== product.maxPrice}
      badges={['new']}
      showWishlist={false}
      locale={locale}
    />
  );
}

/** The five newest Products on sale, from the API. Hidden while loading, on error or when empty. */
export function SectionNewArrivals(): React.JSX.Element | null {
  const locale = useLocale();
  const t = useTranslations('home.newArrivals');
  const { data } = useQuery({ queryKey: catalogKeys.products(NEWEST), queryFn: async () => getProducts(NEWEST) });
  const [spotlight, ...strip] = data?.data ?? [];

  if (spotlight === undefined) return null;

  return (
    <section>
      <Reveal className="container mx-auto px-4 py-(--space-section-new-arrivals) md:py-(--space-section-new-arrivals-lg)">
        <SectionHeading title={t('title')} subtitle={t('subtitle')} ctaLabel={t('viewAll')} ctaHref={`/${locale}/products`} />
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-5 lg:gap-8">
          <div className="lg:col-span-3">
            <NewArrivalCard product={spotlight} locale={locale} />
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:col-span-2 lg:grid-cols-2">
            {strip.map((product) => (
              <NewArrivalCard key={product.id} product={product} locale={locale} />
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
