import { useMemo, useState } from 'react';

import { Badge } from '@repo/ui/badge';
import { Button } from '@repo/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@repo/ui/dropdown-menu';
import type { SortingState, Table } from '@tanstack/react-table';
import { createColumnHelper } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { Customer } from '@/features/customers/types';
import { useCustomersState } from '@/features/customers/useCustomersState';
import type { DataTablePagination } from '@/shell/DataTable';
import { filterBySearch } from '@/shell/filterBySearch';
import { usePaginationLabels } from '@/shell/usePaginationLabels';
import { useSortedClientDataTable } from '@/shell/useSortedClientDataTable';

const PAGE_SIZE = 20;

export interface CustomerListModel {
  readonly table: Table<Customer>;
  readonly pageItems: Customer[];
  readonly search: string;
  readonly setSearch: (value: string) => void;
  readonly pagination: DataTablePagination;
}

const columnHelper = createColumnHelper<Customer>();

/** The customer list behind one interface: local state, name/email search, sorting and pagination. */
export function useCustomerList(): CustomerListModel {
  const { t } = useTranslation('customers');
  const paginationLabels = usePaginationLabels();
  const { customers, setStatus } = useCustomersState();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState('');

  const filtered = filterBySearch(customers, search, [(c) => c.name, (c) => c.email]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', { header: t('columns.name'), cell: (info) => <span className="font-medium">{info.getValue()}</span> }),
      columnHelper.accessor('email', {
        header: t('columns.email'),
        cell: (info) => <span className="text-muted-foreground">{info.getValue()}</span>,
      }),
      columnHelper.accessor('phone', { header: t('columns.phone') }),
      columnHelper.accessor('ordersCount', { header: t('columns.orders') }),
      columnHelper.display({
        id: 'status',
        header: t('columns.status'),
        cell: ({ row }) => <Badge variant={row.original.status === 'active' ? 'success' : 'destructive'}>{t(`status.${row.original.status}`)}</Badge>,
      }),
      columnHelper.display({
        id: 'actions',
        header: t('columns.actions'),
        meta: { className: 'text-right' },
        cell: ({ row }) => {
          const customer = row.original;
          const nextStatus = customer.status === 'active' ? 'suspended' : 'active';
          return (
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm" aria-label={t('columns.actions')}>
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onSelect={() => {
                      setStatus(customer.id, nextStatus);
                    }}
                  >
                    {nextStatus === 'suspended' ? t('suspend') : t('reactivate')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      }),
    ],
    [t, setStatus],
  );

  const { table, pageItems, pagination } = useSortedClientDataTable(filtered, columns, sorting, setSorting, PAGE_SIZE, paginationLabels);

  return { table, pageItems, search, setSearch, pagination };
}
