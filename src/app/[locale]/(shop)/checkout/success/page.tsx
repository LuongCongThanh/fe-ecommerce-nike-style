// Hallmark redesign · design-system: DESIGN.md · scope: app page (functional, no enrichment)
import { CheckoutSuccess } from '@/modules/checkout/components/CheckoutSuccess';
import { getOrderOrNull } from '@/modules/orders/services/order.service';

// Depends on the request's auth cookies to fetch a real order — see `account/orders/page.tsx` for why
// this can't be statically generated.
export const dynamic = 'force-dynamic';

export default async function CheckoutSuccessPage({
  params,
  searchParams,
}: {
  readonly params: Promise<{ locale: string }>;
  readonly searchParams: Promise<{ orderId?: string }>;
}): Promise<React.JSX.Element> {
  const { locale } = await params;
  const { orderId } = await searchParams;
  const order = await getOrderOrNull(orderId);

  return <CheckoutSuccess locale={locale} orderId={orderId} order={order} />;
}
