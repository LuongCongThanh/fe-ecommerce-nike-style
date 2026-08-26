'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@repo/ui/table';
import { useLocale, useTranslations } from 'next-intl';

import { useAdminInventoryAuditLog } from './useAdminInventory';

/** Shows every on_hand change (newest first) with the actor and before/after values (issue #21's
 * acceptance criteria — "audit-friendly", actor + timestamp). */
export function InventoryAuditLog(): React.JSX.Element {
  const t = useTranslations('inventory.auditLog');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const { data, isLoading, isError } = useAdminInventoryAuditLog();

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold">{t('title')}</h2>

      {isError ? (
        <p role="alert" className="text-destructive text-sm">
          {t('loadError')}
        </p>
      ) : null}
      {isLoading ? <p className="text-muted-foreground text-sm">{tCommon('loading')}</p> : null}

      {data !== undefined ? (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('columns.sku')}</TableHead>
                <TableHead>{t('columns.before')}</TableHead>
                <TableHead>{t('columns.after')}</TableHead>
                <TableHead>{t('columns.actor')}</TableHead>
                <TableHead>{t('columns.at')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-mono text-xs">{entry.skuId}</TableCell>
                  <TableCell>{entry.previousOnHand}</TableCell>
                  <TableCell>{entry.newOnHand}</TableCell>
                  <TableCell>{entry.actorName}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {new Date(entry.at).toLocaleString(locale === 'en' ? 'en-US' : 'vi-VN')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {data.data.length === 0 ? <p className="text-muted-foreground p-6 text-center text-sm">{t('empty')}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
