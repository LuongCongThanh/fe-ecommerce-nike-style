import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@repo/ui/table';
import { useTranslation } from 'react-i18next';

import { useAdminInventoryAuditLog } from './useAdminInventory';

/** Shows every on_hand change (newest first) with the actor and before/after values (issue #21's
 * acceptance criteria — "audit-friendly", actor + timestamp). */
export function InventoryAuditLog(): React.JSX.Element {
  const { t, i18n } = useTranslation('inventory');
  const { t: tCommon } = useTranslation('common');
  const { data, isLoading, isError } = useAdminInventoryAuditLog();

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold">{t('auditLog.title')}</h2>

      {isError ? (
        <p role="alert" className="text-destructive text-sm">
          {t('auditLog.loadError')}
        </p>
      ) : null}
      {isLoading ? <p className="text-muted-foreground text-sm">{tCommon('loading')}</p> : null}

      {data !== undefined ? (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('auditLog.columns.sku')}</TableHead>
                <TableHead>{t('auditLog.columns.before')}</TableHead>
                <TableHead>{t('auditLog.columns.after')}</TableHead>
                <TableHead>{t('auditLog.columns.actor')}</TableHead>
                <TableHead>{t('auditLog.columns.at')}</TableHead>
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
                    {new Date(entry.at).toLocaleString(i18n.language === 'en' ? 'en-US' : 'vi-VN')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {data.data.length === 0 ? <p className="text-muted-foreground p-6 text-center text-sm">{t('auditLog.empty')}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
