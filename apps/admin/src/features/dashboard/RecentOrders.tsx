import { Badge } from '@repo/ui/badge';
import { Skeleton } from '@repo/ui/skeleton';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { orderStatusBadgeVariant } from '@/features/orders/orderStatusVariant';
import { useAdminOrders } from '@/features/orders/useAdminOrders';

const RECENT_ORDERS_COUNT = 5;

/** Latest orders by `created_at`, real data from `useAdminOrders` — no invented rows (Honest UI).
 * Design reference: Sneat admin dashboard's order table widget, trimmed to fields this repo's
 * `Order` schema actually has. */
export function RecentOrders(): React.JSX.Element {
  const { t, i18n } = useTranslation('order');
  const { t: tCommon } = useTranslation('common');
  const dateLocale = i18n.language === 'en' ? 'en-US' : 'vi-VN';
  const { data, isLoading, isError } = useAdminOrders();

  const recentOrders = [...(data ?? [])].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, RECENT_ORDERS_COUNT);

  return (
    <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3">
      <h2 className="text-foreground text-sm font-semibold">{tCommon('dashboard.recentOrdersTitle')}</h2>

      {isError ? (
        <p role="alert" className="text-destructive text-sm">
          {t('loadError')}
        </p>
      ) : null}

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: RECENT_ORDERS_COUNT }, (_, index) => (
            <Skeleton key={index} className="h-9 w-full" />
          ))}
        </div>
      ) : null}

      {!isLoading && !isError && recentOrders.length === 0 ? <p className="text-muted-foreground text-sm">{t('empty')}</p> : null}

      {!isLoading && !isError && recentOrders.length > 0 ? (
        <ul className="divide-border -mx-1 divide-y">
          {recentOrders.map((order) => (
            <li key={order.id} className="flex items-center justify-between gap-3 px-1 py-2">
              <div className="min-w-0">
                <Link to="/orders/$id" params={{ id: String(order.id) }} className="text-foreground truncate text-sm font-medium hover:underline">
                  {order.code}
                </Link>
                <p className="text-muted-foreground text-xs">{new Date(order.created_at).toLocaleDateString(dateLocale)}</p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="text-sm">{order.total.toLocaleString(dateLocale)}₫</span>
                <Badge variant={orderStatusBadgeVariant(order.status)}>{t(`statusLabels.${order.status}`)}</Badge>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
