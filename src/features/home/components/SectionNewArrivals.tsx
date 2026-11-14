'use client';

import { useQuery } from '@tanstack/react-query';
import { useLocale, useTranslations } from 'next-intl';

import { ProductCard } from '@/features/catalog/components/ProductCard';
import { catalogKeys } from '@/features/catalog/queries/catalogKeys';
import { getProducts } from '@/lib/api/endpoints/catalog';
import type { ProductQuery, ProductSummary } from '@/lib/api/models/catalog';
import { QueryState } from '@/shared/ui/QueryState';
import { Reveal } from '@/shared/ui/Reveal';
import { SectionHeading } from '@/shared/ui/SectionHeading';
import { Skeleton } from '@/shared/ui/Skeleton';

const NEWEST: ProductQuery = { sort: 'newest', limit: 5 };

function NewArrivalsSkeleton(): React.JSX.Element {
  return (
    <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-5 lg:gap-8" aria-hidden="true">
      <Skeleton className="aspect-[4/5] rounded-xl lg:col-span-3" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:col-span-2 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={`new-arrival-skeleton-${index.toString()}`} className="aspect-[4/5] rounded-xl" />
        ))}
      </div>
    </div>
  );
}

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

/** The five newest products from the API, with stable loading, error, and empty states. */
export function SectionNewArrivals(): React.JSX.Element {
  const locale = useLocale();
  const t = useTranslations('home.newArrivals');
  const tCommon = useTranslations('common');
  const { data, isLoading, error, refetch } = useQuery({ queryKey: catalogKeys.products(NEWEST), queryFn: async () => getProducts(NEWEST) });
  const [spotlight, ...strip] = data?.data ?? [];

  return (
    <section className="bg-muted/35">
      <Reveal className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <SectionHeading title={t('title')} subtitle={t('subtitle')} ctaLabel={t('viewAll')} ctaHref={`/${locale}/products`} />
        <QueryState
          isLoading={isLoading}
          error={error}
          onRetry={refetch}
          loadingFallback={<NewArrivalsSkeleton />}
          loadingLabel={tCommon('loading')}
          errorTitle={tCommon('errorTitle')}
          errorFallbackDescription={tCommon('errorDescription')}
          retryLabel={tCommon('retry')}
        >
          {spotlight === undefined ? (
            <div className="border-border bg-muted/30 mt-8 rounded-xl border border-dashed px-6 py-10 text-center">
              <h3 className="text-foreground font-semibold">{t('emptyTitle')}</h3>
              <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm leading-relaxed">{t('emptyDescription')}</p>
            </div>
          ) : (
            <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-5 lg:gap-12">
              <div className="lg:col-span-3">
                <NewArrivalCard product={spotlight} locale={locale} />
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4 lg:col-span-2 lg:grid-cols-2">
                {strip.map((product) => (
                  <NewArrivalCard key={product.id} product={product} locale={locale} />
                ))}
              </div>
            </div>
          )}
        </QueryState>
      </Reveal>
    </section>
  );
}
