'use client';

import { TableCell, TableRow } from '@repo/ui/table';
import { useLocale, useTranslations } from 'next-intl';

import { useAdminInventoryAuditLog } from './useAdminInventory';
import { DataTable } from '@/features/shell/DataTable';

/** Shows every on_hand change (newest first) with the actor and before/after values (issue #21's
 * acceptance criteria — "audit-friendly", actor + timestamp). */
export function InventoryAuditLog(): React.JSX.Element {
  const t = useTranslations('inventory.auditLog');
  const locale = useLocale();
  const { data, isLoading, isError } = useAdminInventoryAuditLog();

  const entries = data?.data ?? [];

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold">{t('title')}</h2>

      <DataTable
        headers={[t('columns.sku'), t('columns.before'), t('columns.after'), t('columns.actor'), t('columns.at')]}
        isLoading={isLoading}
        isError={isError}
        errorMessage={t('loadError')}
        isEmpty={entries.length === 0}
        emptyMessage={t('empty')}
      >
        {entries.map((entry) => (
          <TableRow key={entry.id}>
            <TableCell className="font-mono text-xs">{entry.skuId}</TableCell>
            <TableCell>{entry.previousOnHand}</TableCell>
            <TableCell>{entry.newOnHand}</TableCell>
            <TableCell>{entry.actorName}</TableCell>
            <TableCell className="text-muted-foreground text-xs">{new Date(entry.at).toLocaleString(locale === 'en' ? 'en-US' : 'vi-VN')}</TableCell>
          </TableRow>
        ))}
      </DataTable>
    </div>
  );
}
