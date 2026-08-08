import { PageShell } from '@/app/[locale]/(shop)/_lib/components/layout/PageShell';
import { OrdersClient } from '@/app/[locale]/(shop)/_lib/components/orders/OrdersClient';

export default function OrdersPage(): React.JSX.Element {
  return (
    <PageShell.List>
      <h1 className="mb-6 text-2xl font-bold">Đơn hàng của tôi</h1>
      <OrdersClient />
    </PageShell.List>
  );
}
