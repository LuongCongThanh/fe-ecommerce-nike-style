'use client';

import { useMemo } from 'react';

import type { InventoryAuditEntry } from '@repo/schemas/inventory';
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useLocale, useTranslations } from 'next-intl';

import { useAdminInventoryAuditLog } from './useAdminInventory';
import { DataTable } from '@/features/shell/DataTable';

const columnHelper = createColumnHelper<InventoryAuditEntry>();

/** Shows every on_hand change (newest first) with the actor and before/after values (issue #21's
 * acceptance criteria — "audit-friendly", actor + timestamp). */
export function InventoryAuditLog(): React.JSX.Element {
  const t = useTranslations('inventory.auditLog');
  const locale = useLocale();
  const { data, isLoading, isError } = useAdminInventoryAuditLog();

  const entries = data?.data ?? [];

  /* eslint-disable react/no-unstable-nested-components -- these are TanStack column-def `header`/`cell` renderers, not
   * JSX-mounted nested components; the whole `columns` array is memoized below so their identity is stable across renders. */
  const columns = useMemo(
    () => [
      columnHelper.accessor('skuId', { header: t('columns.sku'), cell: (info) => <span className="font-mono text-xs">{info.getValue()}</span> }),
      columnHelper.accessor('previousOnHand', { header: t('columns.before') }),
      columnHelper.accessor('newOnHand', { header: t('columns.after') }),
      columnHelper.accessor('actorName', { header: t('columns.actor') }),
      columnHelper.accessor('at', {
        header: t('columns.at'),
        cell: (info) => (
          <span className="text-muted-foreground text-xs">{new Date(info.getValue()).toLocaleString(locale === 'en' ? 'en-US' : 'vi-VN')}</span>
        ),
      }),
    ],
    [t, locale],
  );
  /* eslint-enable react/no-unstable-nested-components */

  const table = useReactTable({ data: entries, columns, enableSorting: false, getCoreRowModel: getCoreRowModel() });

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold">{t('title')}</h2>

      <DataTable
        table={table}
        isLoading={isLoading}
        isError={isError}
        errorMessage={t('loadError')}
        isEmpty={entries.length === 0}
        emptyMessage={t('empty')}
      />
    </div>
  );
}
