'use client';

import { Skeleton } from '@repo/ui/skeleton';
import { TrendingUp } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { useStaffAuth } from '@/core/session';
import { useAdminOrders } from '@/features/orders/useAdminOrders';

/**
 * Personalized headline card — 1/3-width pairing with a 2/3-width chart, same proportion as Sneat
 * admin template's dashboard hero row (`MuiGrid2-grid-md-4` + `MuiGrid2-grid-md-8`). The greeting name
 * is the real signed-in Staff (`useStaffAuth`), and the headline number is `Σ order.total` over every
 * real order — not the invented "Best seller of the month" copy Sneat's version shows (design review:
 * "chỉ giữ bố cục cho phần có dữ liệu thật").
 */
export function DashboardHero(): React.JSX.Element {
  const t = useTranslations('common.dashboard');
  const { staff } = useStaffAuth();
  const { data, isLoading, isError } = useAdminOrders();

  const totalRevenue = (data ?? []).reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="bg-primary text-primary-foreground flex h-full flex-col justify-between gap-6 rounded-xl border p-5">
      <div>
        <p className="text-sm font-medium opacity-90">{t('heroGreeting', { name: staff?.name ?? '' })}</p>
        <p className="mt-1 text-sm opacity-75">{t('heroSubtitle')}</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="bg-primary-foreground/15 flex size-10 shrink-0 items-center justify-center rounded-lg">
          <TrendingUp className="size-5" />
        </div>
        <div>
          <p className="text-xs opacity-75">{t('heroRevenueLabel')}</p>
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
