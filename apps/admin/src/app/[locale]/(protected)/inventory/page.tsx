'use client';

import { useMemo, useState } from 'react';

import type { InventoryItem } from '@repo/schemas/inventory';
import type { SortingState } from '@tanstack/react-table';
import { createColumnHelper } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';

import { Badge } from '@repo/ui/badge';
import { InventoryAuditLog } from '@/features/inventory/InventoryAuditLog';
import { InventoryOnHandCell } from '@/features/inventory/InventoryOnHandCell';
import { useAdminInventory } from '@/features/inventory/useAdminInventory';
import { DataTable } from '@/features/shell/DataTable';
import { PageHeader } from '@/features/shell/PageHeader';
import { useSortedClientDataTable } from '@/features/shell/useSortedClientDataTable';

const PAGE_SIZE = 20;

const columnHelper = createColumnHelper<InventoryItem>();

export default function InventoryPage(): React.JSX.Element {
  const t = useTranslations('inventory');
  const tCommon = useTranslations('common');
  const [sorting, setSorting] = useState<SortingState>([]);
  const { data, isLoading, isError } = useAdminInventory();

  const allItems = data?.data ?? [];

  /* eslint-disable react/no-unstable-nested-components -- these are TanStack column-def `header`/`cell` renderers, not
   * JSX-mounted nested components; the whole `columns` array is memoized below so their identity is stable across renders. */
  const columns = useMemo(
    () => [
      columnHelper.accessor('productName', { header: t('columns.product'), cell: (info) => <span className="font-medium">{info.getValue()}</span> }),
      columnHelper.display({
        id: 'variant',
        header: t('columns.variant'),
        enableSorting: false,
        cell: ({ row }) => {
          const { color, size } = row.original;
          return color !== null || size !== null ? (
            <Badge variant="outline">{[color, size].filter(Boolean).join(' / ')}</Badge>
          ) : (
            <span className="text-muted-foreground">—</span>
          );
        },
      }),
      columnHelper.display({
        id: 'onHand',
        header: t('columns.onHand'),
        enableSorting: false,
        cell: ({ row }) => <InventoryOnHandCell item={row.original} />,
      }),
      columnHelper.accessor('reserved', { header: t('columns.reserved') }),
      columnHelper.accessor('available', { header: t('columns.available'), cell: (info) => <span className="font-medium">{info.getValue()}</span> }),
    ],
    [t],
  );
  /* eslint-enable react/no-unstable-nested-components */

  const { table, pageItems, pagination } = useSortedClientDataTable(allItems, columns, sorting, setSorting, PAGE_SIZE, {
    pageOf: (page, totalPages) => tCommon('pagination.pageOf', { page, totalPages }),
    previous: tCommon('pagination.previous'),
    next: tCommon('pagination.next'),
  });

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <PageHeader title={t('title')} />

        <DataTable
          table={table}
          isLoading={isLoading}
          isError={isError}
          errorMessage={t('loadError')}
          isEmpty={pageItems.length === 0}
          emptyMessage={t('empty')}
          pagination={pagination}
        />
      </div>

      <InventoryAuditLog />
    </div>
  );
}
