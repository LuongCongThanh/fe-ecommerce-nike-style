import { useMemo } from 'react';

import type { InventoryAuditEntry } from '@repo/schemas/inventory';
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';

import { useAdminInventoryAuditLog } from './useAdminInventory';
import { DataTable } from '@/shell/DataTable';

const columnHelper = createColumnHelper<InventoryAuditEntry>();

/** Shows every on_hand change (newest first) with the actor and before/after values (issue #21's
 * acceptance criteria — "audit-friendly", actor + timestamp). */
export function InventoryAuditLog(): React.JSX.Element {
  const { t, i18n } = useTranslation('inventory');
  const { data, isLoading, isError } = useAdminInventoryAuditLog();

  const entries = data?.data ?? [];
  const dateLocale = i18n.language === 'en' ? 'en-US' : 'vi-VN';

  /* eslint-disable react/no-unstable-nested-components -- these are TanStack column-def `header`/`cell` renderers, not
   * JSX-mounted nested components; the whole `columns` array is memoized below so their identity is stable across renders. */
  const columns = useMemo(
    () => [
      columnHelper.accessor('skuId', {
        header: t('auditLog.columns.sku'),
        cell: (info) => <span className="font-mono text-xs">{info.getValue()}</span>,
      }),
      columnHelper.accessor('previousOnHand', { header: t('auditLog.columns.before') }),
      columnHelper.accessor('newOnHand', { header: t('auditLog.columns.after') }),
      columnHelper.accessor('actorName', { header: t('auditLog.columns.actor') }),
      columnHelper.accessor('at', {
        header: t('auditLog.columns.at'),
        cell: (info) => <span className="text-muted-foreground text-xs">{new Date(info.getValue()).toLocaleString(dateLocale)}</span>,
      }),
    ],
    [t, dateLocale],
  );
  /* eslint-enable react/no-unstable-nested-components */

  const table = useReactTable({ data: entries, columns, enableSorting: false, getCoreRowModel: getCoreRowModel() });

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold">{t('auditLog.title')}</h2>

      <DataTable
        table={table}
        isLoading={isLoading}
        isError={isError}
        errorMessage={t('auditLog.loadError')}
        isEmpty={entries.length === 0}
        emptyMessage={t('auditLog.empty')}
      />
    </div>
  );
}
