'use client';

import { useMemo, useState } from 'react';

import type { Order, OrderStatus } from '@repo/schemas/order';
import { Badge } from '@repo/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@repo/ui/tabs';
import type { SortingState } from '@tanstack/react-table';
import { createColumnHelper, getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

import { orderStatusBadgeVariant } from '@/features/orders/orderStatusVariant';
import { useAdminOrders } from '@/features/orders/useAdminOrders';
import { useOrderStatusFilter } from '@/features/orders/useOrderStatusFilter';
import { DataTable } from '@/features/shell/DataTable';
import { PageHeader } from '@/features/shell/PageHeader';
import { useClientDataTablePagination } from '@/features/shell/useClientDataTablePagination';

const PAGE_SIZE = 20;
const STATUS_OPTIONS: readonly OrderStatus[] = [
  'PENDING',
  'PROCESSING',
  'PACKED',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'RETURN_REQUESTED',
  'RETURNED',
];

const columnHelper = createColumnHelper<Order>();

export default function OrdersPage(): React.JSX.Element {
  const t = useTranslations('order');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const dateLocale = locale === 'en' ? 'en-US' : 'vi-VN';
  const [sorting, setSorting] = useState<SortingState>([]);
  const { data, isLoading, isError } = useAdminOrders();
  const { status, setStatus } = useOrderStatusFilter();

  const allOrders = (data ?? []).filter((order) => status === 'ALL' || order.status === status);
  const { pageItems: pageOrders, pagination } = useClientDataTablePagination(allOrders, PAGE_SIZE, {
    pageOf: (page, totalPages) => tCommon('pagination.pageOf', { page, totalPages }),
    previous: tCommon('pagination.previous'),
    next: tCommon('pagination.next'),
  });

  /* eslint-disable react/no-unstable-nested-components -- these are TanStack column-def `header`/`cell` renderers, not
   * JSX-mounted nested components; the whole `columns` array is memoized below so their identity is stable across renders. */
  const columns = useMemo(
    () => [
      columnHelper.accessor('code', {
        header: t('columns.code'),
        cell: (info) => <span className="font-medium">{info.getValue()}</span>,
      }),
      columnHelper.accessor('status', {
        header: t('columns.status'),
        enableSorting: false,
        cell: (info) => <Badge variant={orderStatusBadgeVariant(info.getValue())}>{t(`statusLabels.${info.getValue()}`)}</Badge>,
      }),
      columnHelper.accessor('total', {
        header: t('columns.total'),
        cell: (info) => `${info.getValue().toLocaleString(dateLocale)}₫`,
      }),
      columnHelper.accessor('created_at', {
        header: t('columns.createdAt'),
        cell: (info) => <span className="text-muted-foreground text-xs">{new Date(info.getValue()).toLocaleDateString(dateLocale)}</span>,
      }),
      columnHelper.display({
        id: 'actions',
        header: t('columns.actions'),
        meta: { className: 'text-right' },
        cell: ({ row }) => (
          <Link href={`/orders/${String(row.original.id)}`} className="text-primary text-sm underline-offset-2 hover:underline">
            {t('viewDetail')}
          </Link>
        ),
      }),
    ],
    [t, dateLocale],
  );
  /* eslint-enable react/no-unstable-nested-components */

  const table = useReactTable({
    data: pageOrders,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="space-y-4">
      <PageHeader title={t('title')} />

      <Tabs
        value={status}
        onValueChange={(value) => {
          setStatus(value as OrderStatus | 'ALL');
        }}
      >
        <TabsList variant="line" className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="ALL">{t('statusFilterAll')}</TabsTrigger>
          {STATUS_OPTIONS.map((option) => (
            <TabsTrigger key={option} value={option}>
              {t(`statusLabels.${option}`)}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <DataTable
        table={table}
        isLoading={isLoading}
        isError={isError}
        errorMessage={t('loadError')}
        isEmpty={pageOrders.length === 0}
        emptyMessage={t('empty')}
        pagination={pagination}
      />
    </div>
  );
}
