// Hallmark redesign · design-system: design.md · scope: app page (functional, no enrichment)
// Apple Design pass · §1 no spinner cliff between pages — the grid stays, and says it is working
'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { useTranslations } from 'next-intl';

import { CatalogProductGrid } from '@/features/catalog/components/CatalogProductGrid';
import { CatalogGridSkeleton } from '@/features/catalog/components/ProductSkeletons';
import { useCatalogListing } from '@/features/catalog/hooks/useCatalogListing';
import { Button } from '@/shared/ui/Button';
import { Pagination } from '@/shared/ui/Pagination';
import { QueryState } from '@/shared/ui/QueryState';
import { cn } from '@/shared/utils/utils';

export default function ProductsClient(): React.JSX.Element {
  const t = useTranslations('common');
  const tProduct = useTranslations('product');
  const { data, isLoading, isPlaceholderData, error, refetch, categorySlug: category, onPageChange } = useCatalogListing();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // Same "clear filters" affordance as CategoryClient (UI/UX audit finding, PLP § 3) — any query
  // param other than `category` is a narrowing filter (price, sort, gender…).
  const hasActiveFilters = Array.from(searchParams.keys()).some((key) => key !== 'category');

  return (
    <div className="flex flex-col gap-8">
      <header className="border-border/80 flex flex-col gap-4 border-b pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xl">
          <p className="text-muted-foreground mb-3 text-[11px] font-bold tracking-[0.18em] uppercase">{tProduct('eyebrow')}</p>
          <h1 className="font-display text-4xl font-semibold tracking-[-0.035em] text-balance sm:text-5xl">
            {category !== undefined ? tProduct('listingCategoryTitle', { category }) : tProduct('listingTitle')}
          </h1>
          <p className="text-muted-foreground mt-3 max-w-lg text-sm leading-6 sm:text-base">
            {category !== undefined ? tProduct('listingCategorySubtitle', { category }) : tProduct('listingSubtitle')}
          </p>
        </div>
        {data !== undefined ? <p className="text-muted-foreground shrink-0 text-sm">{tProduct('resultsCount', { count: data.meta.total })}</p> : null}
      </header>

      <QueryState
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        loadingFallback={<CatalogGridSkeleton />}
        loadingLabel={t('loading')}
        errorTitle={tProduct('loadError')}
        errorDescription={t('errorDescription')}
        errorFallbackDescription={t('errorDescription')}
        retryLabel={t('retry')}
      >
        {data !== undefined ? (
          <>
            {/* The outgoing page recedes instead of disappearing — continuous feedback, not a gap. */}
            <div
              aria-busy={isPlaceholderData}
              className={cn('transition-opacity duration-(--duration-normal) ease-out', isPlaceholderData && 'pointer-events-none opacity-55')}
            >
              <CatalogProductGrid
                products={data.data}
                emptyStateAction={
                  hasActiveFilters ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        router.push(pathname);
                      }}
                      className="cursor-pointer"
                    >
                      {tProduct('clearFilters')}
                    </Button>
                  ) : null
                }
              />
            </div>
            <span role="status" aria-live="polite" className="sr-only">
              {isPlaceholderData ? tProduct('loadingProducts') : ''}
            </span>
            {data.meta.totalPages > 1 && (
              <Pagination
                currentPage={data.meta.page}
                totalPages={data.meta.totalPages}
                onPageChange={onPageChange}
                previousLabel={tProduct('previousPage')}
                nextLabel={tProduct('nextPage')}
              />
            )}
          </>
        ) : null}
      </QueryState>
    </div>
  );
}
