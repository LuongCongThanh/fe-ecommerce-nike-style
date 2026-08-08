import { orderActions } from '@/app/[locale]/(shop)/_lib/api/order';
import { PageShell } from '@/app/[locale]/(shop)/_lib/components/layout/PageShell';
import { OrdersClient } from '@/app/[locale]/(shop)/_lib/components/orders/OrdersClient';
import type { Order } from '@/shared/types/order';

// Orders are per-user and depend on the request's auth cookies — this route
// can never be statically generated. Without this, `next build` tries to
// prerender it, the API call has no live session/backend to answer, and the
// build hangs until Next's SSG worker times out (60s × 3 retries → build fail).
export const dynamic = 'force-dynamic';

async function getOrders(): Promise<Order[]> {
  try {
    return await orderActions.list();
  } catch {
    return [];
  }
}

export default async function OrdersPage(): Promise<React.JSX.Element> {
  const orders = await getOrders();

  return (
    <PageShell.List>
      <h1 className="mb-6 text-2xl font-bold">Đơn hàng của tôi</h1>
      <OrdersClient orders={orders} />
    </PageShell.List>
  );
}
