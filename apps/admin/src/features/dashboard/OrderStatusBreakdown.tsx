'use client';

import { ChartContainer, ChartTooltip, ChartTooltipContent, RechartsPrimitives, type ChartConfig } from '@repo/ui/chart';
import { Skeleton } from '@repo/ui/skeleton';
import { useTranslations } from 'next-intl';

import { useAdminOrders } from '@/features/orders/useAdminOrders';

const STATUS_ORDER = ['PENDING', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURN_REQUESTED', 'RETURNED'] as const;

const CHART_CONFIG: ChartConfig = {
  count: { label: 'Orders', color: 'var(--color-brand-500)' },
};

/** Real order-status counts from `useAdminOrders`, never invented numbers — same data contract as
 * the CSS-bar version this replaces, now rendered with `@repo/ui/chart` (Recharts) per the admin
 * redesign's "shadcn/ui Charts" decision. Statuses with zero orders still get a (zero-width) bar so
 * the chart doesn't silently drop them. */
export function OrderStatusBreakdown(): React.JSX.Element {
  const t = useTranslations('order');
  const { data, isLoading, isError } = useAdminOrders();

  const counts = STATUS_ORDER.map((status) => ({
    status,
    label: t(`statusLabels.${status}`),
    count: data?.filter((order) => order.status === status).length ?? 0,
  }));

  return (
    <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3">
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
      ) : null}

      {!isLoading && !isError && data?.length !== 0 ? (
        <ChartContainer config={CHART_CONFIG} className="aspect-auto h-64 w-full">
          <RechartsPrimitives.BarChart data={counts} layout="vertical" margin={{ left: 8 }}>
            <RechartsPrimitives.CartesianGrid horizontal={false} strokeDasharray="3 3" />
            <RechartsPrimitives.XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} />
            <RechartsPrimitives.YAxis type="category" dataKey="label" tickLine={false} axisLine={false} width={110} />
            <ChartTooltip cursor={{ fill: 'var(--color-muted)' }} content={<ChartTooltipContent hideLabel />} />
            <RechartsPrimitives.Bar dataKey="count" fill="var(--color-count)" radius={4} />
          </RechartsPrimitives.BarChart>
        </ChartContainer>
      ) : null}

      {!isLoading && !isError && data?.length === 0 ? <p className="text-muted-foreground text-sm">{t('empty')}</p> : null}
    </div>
  );
}
