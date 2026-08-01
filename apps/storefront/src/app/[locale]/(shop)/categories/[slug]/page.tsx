import { notFound } from 'next/navigation';

import { CategoryClient } from '@/app/[locale]/(shop)/_lib/components/categories/CategoryClient';
import { FilterSidebar } from '@/app/[locale]/(shop)/_lib/components/categories/FilterSidebar';
import { PageShell } from '@/app/[locale]/(shop)/_lib/components/layout/PageShell';
import { getCategoryBySlug } from '@/app/[locale]/(shop)/_lib/queries/category';

interface CategoryPageProps {
  readonly params: Promise<{
    locale: string;
    slug: string;
  }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (category === null) {
    notFound();
  }

  return (
    <PageShell.Browse>
      {/* Breadcrumbs placeholder */}
      <nav className="text-muted-foreground mb-8 text-sm">
        <ol className="flex items-center space-x-2">
          <li>Trang chủ</li>
          <li>/</li>
          <li>Danh mục</li>
          <li>/</li>
          <li className="text-foreground font-medium">{category.name}</li>
        </ol>
      </nav>

      <header className="mb-12">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{category.name}</h1>
        {category.description !== undefined && category.description !== '' && (
          <p className="text-muted-foreground mt-4 max-w-2xl text-lg">{category.description}</p>
        )}
      </header>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Sidebar */}
        <div className="w-full lg:w-64 lg:shrink-0">
          <FilterSidebar />
        </div>

        {/* Content */}
        <div className="flex-1">
          <CategoryClient categorySlug={slug} />
        </div>
      </div>
    </PageShell.Browse>
  );
}
