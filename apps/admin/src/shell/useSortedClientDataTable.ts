import { useMemo } from 'react';

import type { ColumnDef, OnChangeFn, SortingState, Table } from '@tanstack/react-table';
import { getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';

import type { ClientDataTablePaginationLabels, ClientDataTablePaginationResult } from '@/shell/useClientDataTablePagination';
import { useClientDataTablePagination } from '@/shell/useClientDataTablePagination';

export interface SortedClientDataTableResult<T> {
  readonly table: Table<T>;
  readonly pageItems: T[];
  readonly pagination: ClientDataTablePaginationResult<T>['pagination'];
}

/**
 * `useClientDataTablePagination` + `useReactTable` combined so sorting happens on the *full* item
 * list before it gets sliced into a page, instead of only reordering whatever the current page
 * already contains (sorting orders/inventory/staff only reshuffled the visible page because
 * `getSortedRowModel` ran on the already-paginated slice).
 *
 * Runs sorting twice: once over the full `items` to compute the correct page slice, once (a no-op,
 * since the slice is already ordered) over that slice so the returned `table` still owns sorting
 * state/column defs for `DataTable`'s header click handlers.
 */
export function useSortedClientDataTable<T>(
  items: readonly T[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- matches `useReactTable`'s own `ColumnDef<TData, any>` signature; callers pass columns built by `createColumnHelper<T>()` with concrete value types.
  columns: ColumnDef<T, any>[],
  sorting: SortingState,
  onSortingChange: OnChangeFn<SortingState>,
  pageSize: number,
  labels: ClientDataTablePaginationLabels,
): SortedClientDataTableResult<T> {
  const sortTable = useReactTable({
    data: items as T[],
    columns,
    state: { sorting },
    onSortingChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const sortedItems = useMemo(
    () => sortTable.getSortedRowModel().rows.map((row) => row.original),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `sortTable` is recreated every render; `items`/`sorting` are the real recompute triggers.
    [items, sorting],
  );

  const { pageItems, pagination } = useClientDataTablePagination(sortedItems, pageSize, labels);

  const table = useReactTable({
    data: pageItems,
    columns,
    state: { sorting },
    onSortingChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return { table, pageItems, pagination };
}
