'use client';

import { useState } from 'react';

import { useTranslations } from 'next-intl';

import { InventoryAuditLog } from '@/features/inventory/InventoryAuditLog';
import { InventoryRow } from '@/features/inventory/InventoryRow';
import { useAdminInventory } from '@/features/inventory/useAdminInventory';
import { DataTable } from '@/features/shell/DataTable';
import { PageHeader } from '@/features/shell/PageHeader';

const PAGE_SIZE = 20;

export default function InventoryPage(): React.JSX.Element {
  const t = useTranslations('inventory');
  const tCommon = useTranslations('common');
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useAdminInventory();

  const allItems = data?.data ?? [];
  const totalPages = Math.max(1, Math.ceil(allItems.length / PAGE_SIZE));
  const pageItems = allItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
          pagination={{
            page,
            totalPages,
            onPrevious: () => {
              setPage((p) => p - 1);
            },
            onNext: () => {
              setPage((p) => p + 1);
            },
            label: tCommon('pagination.pageOf', { page, totalPages }),
            previousLabel: tCommon('pagination.previous'),
            nextLabel: tCommon('pagination.next'),
          }}
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
