import { HydrationBoundary } from '@tanstack/react-query';

import { ProductDetailPageClient } from '@/modules/catalog/product-detail/components/ProductDetailPageClient';
import { prefetchProductDetail } from '@/modules/catalog/server/prefetchCatalog';

interface ProductPageProps {
  readonly params: Promise<{
    locale: string;
    slug: string;
  }>;
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { locale, slug } = await params;
  const dehydratedState = await prefetchProductDetail(slug);

  return (
    <HydrationBoundary state={dehydratedState}>
      <ProductDetailPageClient slug={slug} locale={locale} />
    </HydrationBoundary>
  );
}
