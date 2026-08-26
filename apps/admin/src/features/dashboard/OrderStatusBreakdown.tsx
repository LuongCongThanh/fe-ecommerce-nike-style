'use client';

import { Skeleton } from '@repo/ui/skeleton';
import { useTranslations } from 'next-intl';

import { useAdminOrders } from '@/features/orders/useAdminOrders';

const STATUS_ORDER = ['PENDING', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURN_REQUESTED', 'RETURNED'] as const;

/** Tier A CSS bar chart — bar widths are real counts from `useAdminOrders`, never invented numbers.
 * Statuses with zero orders are still listed (at 0 width) so the chart doesn't silently drop them. */
export function OrderStatusBreakdown(): React.JSX.Element {
  const t = useTranslations('order');
  const { data, isLoading, isError } = useAdminOrders();

  const counts = STATUS_ORDER.map((status) => ({
    status,
    count: data?.filter((order) => order.status === status).length ?? 0,
  }));
  const max = Math.max(1, ...counts.map((c) => c.count));

  return (
    <div className="bg-card space-y-3 rounded-xl border p-4">
      <h2 className="text-foreground text-sm font-semibold">{t('columns.status')}</h2>

      {isError ? (
        <p role="alert" className="text-destructive text-sm">
          {t('loadError')}
        </p>
      ) : null}

      {isLoading ? (
        <div className="space-y-2">
          {STATUS_ORDER.map((status) => (
            <Skeleton key={status} className="h-5 w-full" />
          ))}
        </div>
      ) : (
        <ul className="space-y-2">
          {counts.map(({ status, count }) => (
            <li key={status} className="flex items-center gap-3 text-sm">
              <span className="text-muted-foreground w-28 shrink-0 truncate">{t(`statusLabels.${status}`)}</span>
              <span className="bg-muted relative h-2 flex-1 overflow-hidden rounded-full">
                <span className="bg-primary absolute inset-y-0 left-0 rounded-full" style={{ width: `${String((count / max) * 100)}%` }} />
              </span>
              <span className="text-foreground w-6 shrink-0 text-right font-medium">{count}</span>
            </li>
          ))}
        </ul>
      )}

      {!isLoading && !isError && data?.length === 0 ? <p className="text-muted-foreground text-sm">{t('empty')}</p> : null}
    </div>
  );
}
