import { Button } from '@repo/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@repo/ui/table';
import type { Table as TanstackTable } from '@tanstack/react-table';
import { flexRender } from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';

import { TableSkeleton } from '@/features/shell/TableSkeleton';

/**
 * Column-level rendering hints TanStack's `columnDef` has no first-class slot for — e.g. right-aligning
 * an actions column, or a fixed-width checkbox column. Set via `columnHelper.display({ meta: {...} })`
 * and applied to both the `<TableHead>` and `<TableCell>` DataTable renders for that column.
 */
declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- TData/TValue are part of the augmented interface's shape, not used in the body
  interface ColumnMeta<TData, TValue> {
    readonly className?: string;
  }
}

export interface DataTablePagination {
  readonly page: number;
  readonly totalPages: number;
  readonly onPrevious: () => void;
  readonly onNext: () => void;
  readonly label: string;
  readonly previousLabel: string;
  readonly nextLabel: string;
  /** Optional numbered-page buttons (design reference: Sneat admin's "1 2 3 4 5 ›" pagination) —
   * omit to keep the plain Previous/Next footer every list page already had. */
  readonly onPageChange?: (page: number) => void;
}

/** A short, centred window of page numbers around the current page (never more than 5), so the
 * footer stays a fixed width instead of listing every page on a 50-page table. */
function pageWindow(page: number, totalPages: number): number[] {
  const size = Math.min(5, totalPages);
  let start = Math.max(1, page - Math.floor(size / 2));
  const end = Math.min(totalPages, start + size - 1);
  start = Math.max(1, end - size + 1);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

interface DataTableProps<TData> {
  /** A `useReactTable()` instance — column defs, sorting, and row-selection state all live on it;
   * DataTable only renders what it reports (headers/rows/sort affordance). */
  readonly table: TanstackTable<TData>;
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly errorMessage: string;
  readonly isEmpty: boolean;
  readonly emptyMessage: string;
  readonly pagination?: DataTablePagination;
}

/** Shared list-page shell (header row + loading skeleton + error + empty state + optional
 * pagination footer) — every list page (staff/products/categories/orders/inventory) used to
 * reimplement this by hand, one drifting from the rest each time it changed (UI/UX audit finding #6).
 * Table *rendering* is TanStack Table's `flexRender`; DataTable itself only owns the surrounding shell. */
export function DataTable<TData>({
  table,
  isLoading,
  isError,
  errorMessage,
  isEmpty,
  emptyMessage,
  pagination,
}: DataTableProps<TData>): React.JSX.Element {
  return (
    <div className="space-y-4">
      {isError ? (
        <p role="alert" className="text-destructive text-sm">
          {errorMessage}
        </p>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pt-4 pb-3 sm:px-6 dark:border-gray-800 dark:bg-white/3">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-gray-100 hover:bg-transparent dark:border-gray-800">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={`text-theme-xs py-3 font-medium text-gray-500 dark:text-gray-400 ${header.column.columnDef.meta?.className ?? ''}`}
                  >
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <button
                        type="button"
                        onClick={header.column.getToggleSortingHandler()}
                        className="inline-flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200"
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() === 'asc' ? (
                          <ArrowUp className="size-3.5" aria-hidden="true" />
                        ) : header.column.getIsSorted() === 'desc' ? (
                          <ArrowDown className="size-3.5" aria-hidden="true" />
                        ) : (
                          <ArrowUpDown className="size-3.5 opacity-40" aria-hidden="true" />
                        )}
                      </button>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {isLoading ? (
              <TableSkeleton columns={table.getAllLeafColumns().length} />
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() ? 'selected' : undefined}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={cell.column.columnDef.meta?.className}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {!isLoading && !isError && isEmpty ? <p className="text-muted-foreground p-6 text-center text-sm">{emptyMessage}</p> : null}
      </div>

      {!isLoading && !isError && !isEmpty && pagination !== undefined && pagination.totalPages > 1 ? (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{pagination.label}</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={pagination.page <= 1} onClick={pagination.onPrevious}>
              {pagination.previousLabel}
            </Button>
            {pagination.onPageChange !== undefined ? (
              <div className="flex items-center gap-1">
                {pageWindow(pagination.page, pagination.totalPages).map((pageNumber) => (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => {
                      pagination.onPageChange?.(pageNumber);
                    }}
                    aria-current={pageNumber === pagination.page ? 'page' : undefined}
                    className={`flex size-8 items-center justify-center rounded-lg text-sm font-medium ${
                      pageNumber === pagination.page
                        ? 'bg-brand-500 text-white'
                        : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5'
                    }`}
                  >
                    {pageNumber}
                  </button>
                ))}
              </div>
            ) : null}
            <Button variant="outline" size="sm" disabled={pagination.page >= pagination.totalPages} onClick={pagination.onNext}>
              {pagination.nextLabel}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
