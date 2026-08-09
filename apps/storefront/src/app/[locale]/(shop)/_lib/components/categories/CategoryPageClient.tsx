'use client';

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
  const { data: categories, isLoading } = useCategoryTree();

  if (isLoading) {
    return (
      <PageShell.Browse>
        <p className="text-muted-foreground py-24 text-center">Loading…</p>
      </PageShell.Browse>
    );
  }

  const category = categories?.find((c) => c.slug === slug) ?? null;

  if (category === null) {
    return (
      <PageShell.Browse>
        <div className="flex min-h-100 flex-col items-center justify-center text-center">
          <h1 className="text-2xl font-bold">Category not found</h1>
          <p className="text-muted-foreground mt-2">The category you're looking for doesn't exist.</p>
        </div>
      </PageShell.Browse>
    );
  }

  const parent = category.parentId !== null ? (categories?.find((c) => c.id === category.parentId) ?? null) : null;

  return (
    <PageShell.Browse>
      <nav className="text-muted-foreground mb-8 text-sm">
        <ol className="flex items-center space-x-2">
          <li>Home</li>
          <li>/</li>
          <li>Categories</li>
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
    </PageShell.Browse>
  );
}
