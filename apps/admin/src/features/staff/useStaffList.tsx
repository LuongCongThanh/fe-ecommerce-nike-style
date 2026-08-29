import { useMemo, useState } from 'react';

import type { Staff } from '@repo/schemas/staff';
import type { SortingState, Table } from '@tanstack/react-table';
import { createColumnHelper } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';

import type { DataTablePagination } from '@/shell/DataTable';
import { filterBySearch } from '@/shell/filterBySearch';
import { usePaginationLabels } from '@/shell/usePaginationLabels';
import { useSortedClientDataTable } from '@/shell/useSortedClientDataTable';
import { StaffActionsCell, StaffActiveCell, StaffRolesCell } from '@/features/staff/StaffCells';
import { useAdminStaffList } from '@/features/staff/useAdminStaffList';

const PAGE_SIZE = 20;

export interface StaffListModel {
  readonly table: Table<Staff>;
  readonly pageStaff: Staff[];
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly search: string;
  readonly setSearch: (value: string) => void;
  readonly pagination: DataTablePagination;
}

const columnHelper = createColumnHelper<Staff>();

/** The staff list behind one interface: query, name/email search, sorting, columns and pagination. */
export function useStaffList(): StaffListModel {
  const { t } = useTranslation('staff');
  const paginationLabels = usePaginationLabels();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState('');
  const { data, isLoading, isError } = useAdminStaffList();

  const allStaff = filterBySearch(data?.data ?? [], search, [(staff) => staff.name, (staff) => staff.email]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', { header: t('columns.name'), cell: (info) => <span className="font-medium">{info.getValue()}</span> }),
      columnHelper.accessor('email', {
        header: t('columns.email'),
        cell: (info) => <span className="text-muted-foreground">{info.getValue()}</span>,
      }),
      columnHelper.display({
        id: 'rolesPermissions',
        header: t('columns.rolesPermissions'),
        cell: ({ row }) => <StaffRolesCell staff={row.original} />,
      }),
      columnHelper.display({
        id: 'active',
        header: t('active'),
        enableSorting: false,
        cell: ({ row }) => <StaffActiveCell staff={row.original} />,
      }),
      columnHelper.display({
        id: 'actions',
        header: t('columns.actions'),
        meta: { className: 'text-right' },
        cell: ({ row }) => <StaffActionsCell staff={row.original} />,
      }),
    ],
    [t],
  );

  const { table, pageItems: pageStaff, pagination } = useSortedClientDataTable(allStaff, columns, sorting, setSorting, PAGE_SIZE, paginationLabels);

  return { table, pageStaff, isLoading, isError, search, setSearch, pagination };
}
