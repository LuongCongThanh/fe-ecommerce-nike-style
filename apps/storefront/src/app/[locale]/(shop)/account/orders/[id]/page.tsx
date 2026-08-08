import { PageShell } from '@/app/[locale]/(shop)/_lib/components/layout/PageShell';
import { OrderDetailClient } from '@/app/[locale]/(shop)/_lib/components/orders/OrderDetailClient';

export default async function OrderDetailPage({ params }: { readonly params: Promise<{ id: string }> }): Promise<React.JSX.Element> {
  const { id } = await params;

  return (
    <PageShell.List>
      <OrderDetailClient id={id} />
    </PageShell.List>
  );
}
