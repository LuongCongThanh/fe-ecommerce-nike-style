'use client';

import { useLocale, useTranslations } from 'next-intl';

import { CategoryCard } from '@/features/catalog/components/CategoryCard';
import { useCategoryTree } from '@/features/catalog/queries/useCategoryTree';
import { placeholderImage } from '@/features/home/home-content';
import { QueryState } from '@/shared/ui/QueryState';
import { Reveal } from '@/shared/ui/Reveal';
import { SectionHeading } from '@/shared/ui/SectionHeading';
import { Skeleton } from '@/shared/ui/Skeleton';

const MAX_CATEGORIES = 7;

function FeaturedCategoriesSkeleton(): React.JSX.Element {
  return (
    <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-6" aria-hidden="true">
      <Skeleton className="col-span-2 row-span-2 aspect-square rounded-xl" />
      {Array.from({ length: MAX_CATEGORIES - 1 }).map((_, index) => (
        <Skeleton key={`category-skeleton-${index.toString()}`} className="aspect-square rounded-xl" />
      ))}
    </div>
  );
}

/** Root Categories from the API. Categories have no image in the API yet, so each gets a placeholder. */
export function SectionFeaturedCategories(): React.JSX.Element {
  const locale = useLocale();
  const t = useTranslations('home.categories');
  const tCommon = useTranslations('common');
  const { data, isLoading, error, refetch } = useCategoryTree();
  const [featured, ...rest] = (data?.tree ?? []).slice(0, MAX_CATEGORIES);

  const card = (category: { slug: string; name: string }) => (
    <CategoryCard
      name={category.name}
      image={placeholderImage(category.slug, '600x600', category.name)}
      href={`/${locale}/categories/${category.slug}`}
    />
  );

  return (
    <section className="bg-background">
      <Reveal className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <SectionHeading title={t('title')} subtitle={t('subtitle')} ctaLabel={t('viewAll')} ctaHref={`/${locale}/products`} />
        <QueryState
          isLoading={isLoading}
          error={error}
          onRetry={refetch}
          loadingFallback={<FeaturedCategoriesSkeleton />}
          loadingLabel={tCommon('loading')}
          errorTitle={tCommon('errorTitle')}
          errorFallbackDescription={tCommon('errorDescription')}
          retryLabel={tCommon('retry')}
        >
          {featured === undefined ? (
            <div className="border-border bg-background mt-7 rounded-xl border border-dashed px-6 py-10 text-center">
              <h3 className="text-foreground font-semibold">{t('emptyTitle')}</h3>
              <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm leading-relaxed">{t('emptyDescription')}</p>
            </div>
          ) : (
            <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4 lg:grid-cols-6 lg:gap-x-5 lg:gap-y-10">
              <div className="col-span-2 row-span-2">{card(featured)}</div>
              {rest.map((category) => (
                <div key={category.id}>{card(category)}</div>
              ))}
            </div>
          )}
        </QueryState>
      </Reveal>
    </section>
  );
}
