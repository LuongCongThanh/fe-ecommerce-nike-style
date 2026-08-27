'use client';

import { useTranslations } from 'next-intl';

import { InventoryAuditLog } from '@/features/inventory/InventoryAuditLog';
import { InventoryRow } from '@/features/inventory/InventoryRow';
import { useAdminInventory } from '@/features/inventory/useAdminInventory';
import { DataTable } from '@/features/shell/DataTable';
import { PageHeader } from '@/features/shell/PageHeader';
import { useClientDataTablePagination } from '@/features/shell/useClientDataTablePagination';

const PAGE_SIZE = 20;

export default function InventoryPage(): React.JSX.Element {
  const t = useTranslations('inventory');
  const tCommon = useTranslations('common');
  const { data, isLoading, isError } = useAdminInventory();

  const allItems = data?.data ?? [];
  const { pageItems, pagination } = useClientDataTablePagination(allItems, PAGE_SIZE, {
    pageOf: (page, totalPages) => tCommon('pagination.pageOf', { page, totalPages }),
    previous: tCommon('pagination.previous'),
    next: tCommon('pagination.next'),
  });

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <PageHeader title={t('title')} />

        <DataTable
          headers={[t('columns.product'), t('columns.variant'), t('columns.onHand'), t('columns.reserved'), t('columns.available')]}
          isLoading={isLoading}
          isError={isError}
          errorMessage={t('loadError')}
          isEmpty={pageItems.length === 0}
          emptyMessage={t('empty')}
          pagination={pagination}
        >
          {pageItems.map((item) => (
            <InventoryRow key={item.skuId} item={item} />
          ))}
        </DataTable>
      </div>

      <InventoryAuditLog />
    </div>
  );
}
