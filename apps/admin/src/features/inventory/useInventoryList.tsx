import { useMemo, useState } from 'react';

import type { InventoryItem } from '@repo/schemas/inventory';
import { Badge } from '@repo/ui/badge';
import type { SortingState, Table } from '@tanstack/react-table';
import { createColumnHelper } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';

import { InventoryOnHandCell } from '@/features/inventory/InventoryOnHandCell';
import { useAdminInventory } from '@/features/inventory/useAdminInventory';
import type { DataTablePagination } from '@/shell/DataTable';
import { filterBySearch } from '@/shell/filterBySearch';
import { usePaginationLabels } from '@/shell/usePaginationLabels';
import { useSortedClientDataTable } from '@/shell/useSortedClientDataTable';

const PAGE_SIZE = 20;

export interface InventoryListModel {
  readonly table: Table<InventoryItem>;
  readonly pageItems: InventoryItem[];
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly search: string;
  readonly setSearch: (value: string) => void;
  readonly pagination: DataTablePagination;
}

const columnHelper = createColumnHelper<InventoryItem>();

/** The inventory list behind one interface: query, product-name search, sorting and pagination. */
export function useInventoryList(): InventoryListModel {
  const { t } = useTranslation('inventory');
  const paginationLabels = usePaginationLabels();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState('');
  const { data, isLoading, isError } = useAdminInventory();

  const allItems = filterBySearch(data?.data ?? [], search, [(item) => item.productName]);

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

  const { table, pageItems, pagination } = useSortedClientDataTable(allItems, columns, sorting, setSorting, PAGE_SIZE, paginationLabels);

  return { table, pageItems, isLoading, isError, search, setSearch, pagination };
}
