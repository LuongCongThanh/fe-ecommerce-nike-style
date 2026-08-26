import { canCancelOrder, canRequestReturn } from '@repo/api-sdk/endpoints/order-transitions';
import type { StorefrontOrder, StorefrontOrderStatus } from '@repo/api-sdk/endpoints/orders';

/**
 * The Order domain type and its transition rules live once, in `@repo/schemas/order` (shape) and
 * `@repo/api-sdk/endpoints/order-transitions` (rules) — both shared with the mock server that
 * enforces them authoritatively. This module only re-exports them under the names the rest of the
 * storefront already imports (`Order`, `OrderStatus`, `canCancelOrder`, `canRequestReturn`), so no
 * call site had to change when the duplicate local declarations were removed.
 */
export { canCancelOrder, canRequestReturn };
export type Order = StorefrontOrder;
export type OrderStatus = StorefrontOrderStatus;
