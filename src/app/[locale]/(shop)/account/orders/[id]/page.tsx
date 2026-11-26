// Hallmark redesign · design-system: design.md · scope: app page (functional, no enrichment)
import { OrderDetailClient } from '@/modules/orders/order-detail/components/OrderDetailClient';
import { PageShell } from '@/shared/components/PageShell';

export default async function OrderDetailPage({ params }: { readonly params: Promise<{ id: string }> }): Promise<React.JSX.Element> {
  const { id } = await params;

  return (
    <PageShell.List>
      <OrderDetailClient id={id} />
    </PageShell.List>
  );
}
