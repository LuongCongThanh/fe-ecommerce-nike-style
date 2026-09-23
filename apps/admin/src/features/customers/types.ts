/** Demo-only — ported from shadcn-admin's "Users" feature, reframed as store Customers (the closer
 * real-world fit for an e-commerce admin — `features/staff` already covers internal accounts/RBAC,
 * a second "Users" page would just duplicate it). No admin-facing customers endpoint exists yet
 * (`packages/api-sdk` only has storefront-side `profile`/`auth`), so this is local-only for now. */
export const CUSTOMER_STATUSES = ['active', 'suspended'] as const;
export type CustomerStatus = (typeof CUSTOMER_STATUSES)[number];

export interface Customer {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly phone: string;
  readonly status: CustomerStatus;
  readonly ordersCount: number;
}
