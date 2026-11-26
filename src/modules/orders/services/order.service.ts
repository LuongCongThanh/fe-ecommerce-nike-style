import type { StorefrontOrder } from '@/integrations/backend/endpoints/orders';
import { getOrder } from '@/integrations/backend/endpoints/orders';

/** Preserve the checkout-success fallback when the request cannot read an order, including
 * when SSR has no in-memory mock auth token. A missing result does not imply a nonexistent order. */
export async function getOrderOrNull(orderId: string | undefined): Promise<StorefrontOrder | null> {
  if (orderId === undefined || orderId === '') return null;
  try {
    return await getOrder(orderId);
  } catch {
    return null;
  }
}
