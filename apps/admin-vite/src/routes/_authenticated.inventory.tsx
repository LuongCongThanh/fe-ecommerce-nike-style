import { Table, TableBody, TableHead, TableHeader, TableRow } from '@repo/ui/table';
import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { InventoryAuditLog } from '@/features/inventory/InventoryAuditLog';
import { InventoryRow } from '@/features/inventory/InventoryRow';
import { useAdminInventory } from '@/features/inventory/useAdminInventory';

export const Route = createFileRoute('/_authenticated/inventory')({
  component: InventoryPage,
});

function InventoryPage(): React.JSX.Element {
  const { t } = useTranslation('inventory');
  const { t: tCommon } = useTranslation('common');
  const { data, isLoading, isError } = useAdminInventory();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold">{t('title')}</h1>

        {isError ? (
          <p role="alert" className="text-destructive mt-2 text-sm">
            {t('loadError')}
          </p>
        ) : null}
        {isLoading ? <p className="text-muted-foreground mt-2 text-sm">{tCommon('loading')}</p> : null}

        {data !== undefined ? (
          <div className="mt-4 rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('columns.product')}</TableHead>
                  <TableHead>{t('columns.variant')}</TableHead>
                  <TableHead>{t('columns.onHand')}</TableHead>
                  <TableHead>{t('columns.reserved')}</TableHead>
                  <TableHead>{t('columns.available')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((item) => (
                  <InventoryRow key={item.skuId} item={item} />
                ))}
              </TableBody>
            </Table>
            {data.data.length === 0 ? <p className="text-muted-foreground p-6 text-center text-sm">{t('empty')}</p> : null}
          </div>
        ) : null}
      </div>

      <InventoryAuditLog />
    </div>
  );
}
