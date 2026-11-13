import { setRequestLocale } from 'next-intl/server';

import { PageShell } from '@/features/storefront-shell/components/PageShell';
import { WishlistClient } from '@/features/wishlist/components/WishlistClient';

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
