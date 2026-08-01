import { setRequestLocale } from 'next-intl/server';

import { PageShell } from '@/app/[locale]/(shop)/_lib/components/layout/PageShell';
import ProductsClient from '@/app/[locale]/(shop)/_lib/components/products/ProductsClient';

interface ProductsPageProps {
  readonly params: Promise<{ locale: string }>;
  readonly searchParams: Promise<{ category?: string; sortBy?: string; page?: string }>;
}

export default async function ProductsPage({ params, searchParams }: ProductsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { category, sortBy, page } = await searchParams;

  return (
    <PageShell.Browse>
      <ProductsClient category={category} sortBy={sortBy} page={page} />
    </PageShell.Browse>
  );
}
