import { HydrationBoundary } from '@tanstack/react-query';
import { setRequestLocale } from 'next-intl/server';

import { SearchClient } from '@/modules/catalog/search/components/SearchClient';
import { prefetchSearchResults } from '@/modules/catalog/server/prefetchCatalog';
import { PageShell } from '@/shared/components/PageShell';

interface SearchPageProps {
  readonly params: Promise<{ locale: string }>;
  readonly searchParams: Promise<{ q?: string | string[]; page?: string | string[] }>;
}

const first = (value: string | string[] | undefined): string | undefined => (Array.isArray(value) ? value[0] : value);

export default async function SearchPage({ params, searchParams }: SearchPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { q, page } = await searchParams;
  const query = first(q);
  // Trim so a whitespace-only `q` (e.g. `?q=%20%20`) is treated the same as no query at all — otherwise
  // it slips past this guard, `useProductSearch` disables its fetch, and `SearchClient` would render its
  // error state instead of the "type something" prompt below.
  const hasQuery = query !== undefined && query.trim() !== '';

  const dehydratedState = await prefetchSearchResults(query, first(page));

  return (
    <HydrationBoundary state={dehydratedState}>
      <PageShell.Browse>
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight">{hasQuery ? `Kết quả tìm kiếm cho "${query}"` : 'Tìm kiếm sản phẩm'}</h1>
        </header>

        {hasQuery ? (
          <SearchClient />
        ) : (
          <div className="flex min-h-75 flex-col items-center justify-center rounded-2xl border border-dashed text-center">
            <p className="text-muted-foreground">Nhập từ khóa vào ô tìm kiếm để bắt đầu.</p>
          </div>
        )}
      </PageShell.Browse>
    </HydrationBoundary>
  );
}
