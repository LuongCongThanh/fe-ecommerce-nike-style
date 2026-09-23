import { Input } from '@repo/ui/input';
import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { InventoryAuditLog } from '@/features/inventory/InventoryAuditLog';
import { useInventoryList } from '@/features/inventory/useInventoryList';
import { DataTable } from '@/shell/DataTable';
import { PageHeader } from '@/shell/PageHeader';

export const Route = createFileRoute('/_authenticated/inventory')({
  component: InventoryPage,
});

function InventoryPage(): React.JSX.Element {
  const { t } = useTranslation('inventory');
  const list = useInventoryList();

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <PageHeader title={t('title')} />

        <Input
          placeholder={t('searchPlaceholder')}
          value={list.search}
          onChange={(e) => {
            list.setSearch(e.target.value);
          }}
          className="max-w-sm"
        />

        <DataTable
          table={list.table}
          isLoading={list.isLoading}
          isError={list.isError}
          errorMessage={t('loadError')}
          isEmpty={list.pageItems.length === 0}
          emptyMessage={t('empty')}
          pagination={list.pagination}
        />
      </div>

      <InventoryAuditLog />
    </div>
  );
}
