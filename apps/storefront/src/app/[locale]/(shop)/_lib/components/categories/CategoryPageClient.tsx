'use client';

import { QueryState } from '@repo/shared/query-state';

import { CategoryClient } from '@/app/[locale]/(shop)/_lib/components/categories/CategoryClient';
import { FilterSidebar } from '@/app/[locale]/(shop)/_lib/components/categories/FilterSidebar';
import { PageShell } from '@/app/[locale]/(shop)/_lib/components/layout/PageShell';
import { useCategoryTree } from '@/app/[locale]/(shop)/_lib/hooks/categories/useCategoryTree';

interface CategoryPageClientProps {
  readonly slug: string;
}

/**
 * Client-driven (not server-rendered) on purpose: Next.js App Router patches global `fetch` for its
 * own caching, which bypasses MSW's Node interceptor for server-component `fetch` calls — mocked
 * catalog reads only intercept reliably in the browser. See Decision #87 (decision-log.md).
 */
export function CategoryPageClient({ slug }: CategoryPageClientProps): React.JSX.Element {
  const { data: categories, isLoading, error, refetch } = useCategoryTree();

  return (
    <PageShell.Browse>
      <QueryState isLoading={isLoading} error={error} onRetry={refetch}>
        <CategoryPageContent slug={slug} categories={categories ?? []} />
      </QueryState>
    </PageShell.Browse>
  );
}

function CategoryPageContent({
  slug,
  categories,
}: {
  readonly slug: string;
  readonly categories: NonNullable<ReturnType<typeof useCategoryTree>['data']>;
}): React.JSX.Element {
  const category = categories.find((c) => c.slug === slug) ?? null;

  if (category === null) {
    return (
      <div className="flex min-h-100 flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-bold">Không tìm thấy danh mục</h1>
        <p className="text-muted-foreground mt-2">Danh mục bạn tìm không tồn tại.</p>
      </div>
    );
  }

  const parent = category.parentId !== null ? (categories.find((c) => c.id === category.parentId) ?? null) : null;

  return (
    <>
      <nav className="text-muted-foreground mb-8 text-sm">
        <ol className="flex items-center space-x-2">
          <li>Trang chủ</li>
          <li>/</li>
          <li>Danh mục</li>
          {parent !== null ? (
            <>
              <li>/</li>
              <li>{parent.name}</li>
            </>
          ) : null}
          <li>/</li>
          <li className="text-foreground font-medium">{category.name}</li>
        </ol>
      </nav>

      <header className="mb-12">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{category.name}</h1>
      </header>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Sidebar */}
        <div className="w-full lg:w-64 lg:shrink-0">
          <FilterSidebar activeCategorySlug={slug} />
        </div>

        {/* Content */}
        <div className="flex-1">
          <CategoryClient categorySlug={slug} />
        </div>
      </div>
    </>
  );
}
