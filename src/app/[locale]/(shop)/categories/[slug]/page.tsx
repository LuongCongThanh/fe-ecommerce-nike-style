import { CategoryPageClient } from '@/features/catalog/category-detail/components/CategoryPageClient';

interface CategoryPageProps {
  readonly params: Promise<{
    locale: string;
    slug: string;
  }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;

  return <CategoryPageClient slug={slug} />;
}
