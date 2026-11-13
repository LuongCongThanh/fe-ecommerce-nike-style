import { setRequestLocale } from 'next-intl/server';

import { ProductDetailPageClient } from '@/app/[locale]/(shop)/_lib/components/products/ProductDetailPageClient';

interface ProductPageProps {
  readonly params: Promise<{
    locale: string;
    slug: string;
  }>;
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  return <ProductDetailPageClient slug={slug} locale={locale} />;
}
