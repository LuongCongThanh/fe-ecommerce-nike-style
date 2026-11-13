import { setRequestLocale } from 'next-intl/server';

import { PageShell } from '@/app/[locale]/(shop)/_lib/components/layout/PageShell';
import { WishlistClient } from '@/app/[locale]/(shop)/_lib/components/wishlist/WishlistClient';

interface WishlistPageProps {
  readonly params: Promise<{ locale: string }>;
}

export default async function WishlistPage({ params }: WishlistPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <PageShell.Browse>
      <h1 className="mb-8 text-3xl font-bold tracking-tight">Sản phẩm yêu thích</h1>
      <WishlistClient locale={locale} />
    </PageShell.Browse>
  );
}
