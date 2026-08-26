import type { ReactNode } from 'react';

import { Button } from '@repo/ui/button';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@repo/ui/table';

import { TableSkeleton } from '@/features/shell/TableSkeleton';

export interface DataTablePagination {
  readonly page: number;
  readonly totalPages: number;
  readonly onPrevious: () => void;
  readonly onNext: () => void;
  readonly label: string;
  readonly previousLabel: string;
  readonly nextLabel: string;
}

interface DataTableProps {
  readonly headers: readonly ReactNode[];
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly errorMessage: string;
  readonly isEmpty: boolean;
  readonly emptyMessage: string;
  readonly children: ReactNode;
  readonly pagination?: DataTablePagination;
}

/** Shared list-page shell (header row + loading skeleton + error + empty state + optional
 * pagination footer) — every list page (staff/products/categories/orders/inventory) used to
 * reimplement this by hand, one drifting from the rest each time it changed (UI/UX audit finding #6). */
export function DataTable({
  headers,
  isLoading,
  isError,
  errorMessage,
  isEmpty,
  emptyMessage,
  children,
  pagination,
}: DataTableProps): React.JSX.Element {
  return (
    <div className="space-y-4">
      {isError ? (
        <p role="alert" className="text-destructive text-sm">
          {errorMessage}
        </p>
      ) : null}

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              {headers.map((header, index) => (
                // eslint-disable-next-line react/no-array-index-key -- headers are a static, order-stable list per page
                <TableHead key={index} className={index === headers.length - 1 ? 'text-right' : undefined}>
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>{isLoading ? <TableSkeleton columns={headers.length} /> : children}</TableBody>
        </Table>
        {!isLoading && !isError && isEmpty ? <p className="text-muted-foreground p-6 text-center text-sm">{emptyMessage}</p> : null}
      </div>

      {!isLoading && !isError && !isEmpty && pagination !== undefined && pagination.totalPages > 1 ? (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{pagination.label}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={pagination.page <= 1} onClick={pagination.onPrevious}>
              {pagination.previousLabel}
            </Button>
            <Button variant="outline" size="sm" disabled={pagination.page >= pagination.totalPages} onClick={pagination.onNext}>
              {pagination.nextLabel}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
