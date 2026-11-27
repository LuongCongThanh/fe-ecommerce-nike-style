// Hallmark redesign · design-system: design.md · scope: app page (functional, no enrichment)

import { CartClient } from '@/modules/cart/components/CartClient';
import { PageShell } from '@/shared/components/PageShell';

interface CartPageProps {
  readonly params: Promise<{ locale: string }>;
}

export default async function CartPage({ params }: CartPageProps) {
  const { locale } = await params;

  return (
    <PageShell.Browse>
      <div className="mb-8 border-b pb-6">
        <h1 className="text-3xl font-bold tracking-tight break-words">Giỏ hàng</h1>
      </div>
      <CartClient locale={locale} />
    </PageShell.Browse>
  );
}
