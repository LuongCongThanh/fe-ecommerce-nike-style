import { setRequestLocale } from 'next-intl/server';

import { CartClient } from '@/app/[locale]/(shop)/_lib/components/cart/CartClient';
import { PageShell } from '@/app/[locale]/(shop)/_lib/components/layout/PageShell';

interface CartPageProps {
  readonly params: Promise<{ locale: string }>;
}

export default async function CartPage({ params }: CartPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <PageShell.Browse>
      <h1 className="mb-8 text-3xl font-bold tracking-tight">Giỏ hàng</h1>
      <CartClient locale={locale} />
    </PageShell.Browse>
  );
}
