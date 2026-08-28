import { Skeleton } from '@repo/ui/skeleton';
import { TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useStaffAuth } from '@/core/session';
import { useAdminOrders } from '@/features/orders/useAdminOrders';

/**
 * Personalized headline card — 1/3-width pairing with a 2/3-width chart, same proportion as Sneat
 * admin template's dashboard hero row. The greeting name is the real signed-in Staff
 * (`useStaffAuth`), and the headline number is `Σ order.total` over every real order — not invented
 * copy (design review: "chỉ giữ bố cục cho phần có dữ liệu thật").
 */
export function DashboardHero(): React.JSX.Element {
  const { t } = useTranslation('common');
  const { staff } = useStaffAuth();
  const { data, isLoading, isError } = useAdminOrders();

  const totalRevenue = (data ?? []).reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="bg-primary text-primary-foreground flex h-full flex-col justify-between gap-6 rounded-xl border p-5">
      <div>
        <p className="text-sm font-medium opacity-90">{t('dashboard.heroGreeting', { name: staff?.name ?? '' })}</p>
        <p className="mt-1 text-sm opacity-75">{t('dashboard.heroSubtitle')}</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="bg-primary-foreground/15 flex size-10 shrink-0 items-center justify-center rounded-lg">
          <TrendingUp className="size-5" />
        </div>
        <div>
          <p className="text-xs opacity-75">{t('dashboard.heroRevenueLabel')}</p>
          {isLoading ? (
            <Skeleton className="mt-1 h-7 w-28 bg-white/20" />
          ) : (
            <p className="text-2xl font-bold tracking-tight">{isError ? '—' : `${totalRevenue.toLocaleString()}₫`}</p>
          )}
        </div>
      </div>
    </div>
  );
}
