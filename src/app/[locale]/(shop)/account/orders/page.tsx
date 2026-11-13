// Hallmark redesign · design-system: design.md · scope: app page (functional, no enrichment)
import { PageShell } from '@/app/[locale]/(shop)/_lib/components/layout/PageShell';
import { OrdersClient } from '@/app/[locale]/(shop)/_lib/components/orders/OrdersClient';

export default function OrdersPage(): React.JSX.Element {
  return (
    <PageShell.List>
      <div className="mb-6 border-b pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-balance">Đơn hàng của tôi</h1>
        <p className="text-muted-foreground mt-1 text-sm">Theo dõi trạng thái và lịch sử mua hàng của bạn.</p>
      </div>
      <OrdersClient />
    </PageShell.List>
  );
}
