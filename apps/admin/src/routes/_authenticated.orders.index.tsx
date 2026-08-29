import type { OrderStatus } from '@repo/schemas/order';
import { Tabs, TabsList, TabsTrigger } from '@repo/ui/tabs';
import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { ORDER_STATUS_OPTIONS, useOrderList } from '@/features/orders/useOrderList';
import { DataTable } from '@/shell/DataTable';
import { PageHeader } from '@/shell/PageHeader';

export const Route = createFileRoute('/_authenticated/orders/')({
  component: OrdersPage,
});

function OrdersPage(): React.JSX.Element {
  const { t } = useTranslation('order');
  const list = useOrderList();

  return (
    <div className="space-y-4">
      <PageHeader title={t('title')} />

      <Tabs
        value={list.status}
        onValueChange={(value) => {
          list.setStatus(value as OrderStatus | 'ALL');
        }}
      >
        <TabsList variant="line" className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="ALL">{t('statusFilterAll')}</TabsTrigger>
          {ORDER_STATUS_OPTIONS.map((option) => (
            <TabsTrigger key={option} value={option}>
              {t(`statusLabels.${option}`)}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <DataTable
        table={list.table}
        isLoading={list.isLoading}
        isError={list.isError}
        errorMessage={t('loadError')}
        isEmpty={list.pageOrders.length === 0}
        emptyMessage={t('empty')}
        pagination={list.pagination}
      />
    </div>
  );
}
