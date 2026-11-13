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
import { SectionHeading } from '@/shared/ui/SectionHeading';
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
      <SectionHeading
        title={category !== undefined ? `Sản phẩm: ${category}` : 'Tất cả sản phẩm'}
        subtitle={category !== undefined ? `Khám phá các sản phẩm trong danh mục ${category}` : 'Khám phá toàn bộ bộ sưu tập của chúng tôi'}
      />

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
                      Xoá bộ lọc
                    </Button>
                  ) : null
                }
              />
            </div>
            <span role="status" aria-live="polite" className="sr-only">
              {isPlaceholderData ? 'Đang tải sản phẩm...' : ''}
            </span>
            {data.meta.totalPages > 1 && <Pagination currentPage={data.meta.page} totalPages={data.meta.totalPages} onPageChange={onPageChange} />}
          </>
        ) : null}
      </QueryState>
    </div>
  );
}
