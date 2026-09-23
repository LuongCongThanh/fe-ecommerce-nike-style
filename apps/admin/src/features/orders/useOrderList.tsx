import { useMemo, useState } from 'react';

import type { Order, OrderStatus } from '@repo/schemas/order';
import { Badge } from '@repo/ui/badge';
import { Button } from '@repo/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@repo/ui/dropdown-menu';
import { Link } from '@tanstack/react-router';
import type { SortingState, Table } from '@tanstack/react-table';
import { createColumnHelper } from '@tanstack/react-table';
import { Copy, Eye, MoreHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { orderStatusBadgeVariant } from '@/features/orders/orderStatusVariant';
import { useAdminOrders } from '@/features/orders/useAdminOrders';
import { useOrderStatusFilter } from '@/features/orders/useOrderStatusFilter';
import type { DataTablePagination } from '@/shell/DataTable';
import { usePaginationLabels } from '@/shell/usePaginationLabels';
import { useSortedClientDataTable } from '@/shell/useSortedClientDataTable';

const PAGE_SIZE = 20;

export const ORDER_STATUS_OPTIONS: readonly OrderStatus[] = [
  'PENDING',
  'PROCESSING',
  'PACKED',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'RETURN_REQUESTED',
  'RETURNED',
];

export interface OrderListModel {
  readonly table: Table<Order>;
  readonly pageOrders: Order[];
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly status: OrderStatus | 'ALL';
  readonly setStatus: (status: OrderStatus | 'ALL') => void;
  readonly pagination: DataTablePagination;
}

const columnHelper = createColumnHelper<Order>();

/** The order list behind one interface: query, status filter, sorting, columns and pagination. */
export function useOrderList(): OrderListModel {
  const { t, i18n } = useTranslation('order');
  const paginationLabels = usePaginationLabels();
  const dateLocale = i18n.language === 'en' ? 'en-US' : 'vi-VN';
  const [sorting, setSorting] = useState<SortingState>([]);
  const { data, isLoading, isError } = useAdminOrders();
  const { status, setStatus } = useOrderStatusFilter();

  const allOrders = (data ?? []).filter((order) => status === 'ALL' || order.status === status);

  const columns = useMemo(
    () => [
      columnHelper.accessor('code', {
        header: t('columns.code'),
        cell: (info) => <span className="font-medium">{info.getValue()}</span>,
      }),
      columnHelper.accessor('status', {
        header: t('columns.status'),
        enableSorting: false,
        cell: (info) => <Badge variant={orderStatusBadgeVariant(info.getValue())}>{t(`statusLabels.${info.getValue()}`)}</Badge>,
      }),
      columnHelper.accessor('total', {
        header: t('columns.total'),
        cell: (info) => `${info.getValue().toLocaleString(dateLocale)}₫`,
      }),
      columnHelper.accessor('created_at', {
        header: t('columns.createdAt'),
        cell: (info) => <span className="text-muted-foreground text-xs">{new Date(info.getValue()).toLocaleDateString(dateLocale)}</span>,
      }),
      columnHelper.display({
        id: 'actions',
        header: t('columns.actions'),
        meta: { className: 'text-right' },
        cell: ({ row }) => (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label={t('columns.actions')}>
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/orders/$id" params={{ id: String(row.original.id) }}>
                    <Eye className="size-4" data-icon="inline-start" />
                    {t('viewDetail')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => {
                    void navigator.clipboard.writeText(row.original.code).then(() => {
                      toast.success(t('codeCopied'));
                    });
                  }}
                >
                  <Copy className="size-4" data-icon="inline-start" />
                  {t('copyCode')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      }),
    ],
    [t, dateLocale],
  );

  const { table, pageItems: pageOrders, pagination } = useSortedClientDataTable(allOrders, columns, sorting, setSorting, PAGE_SIZE, paginationLabels);

  return { table, pageOrders, isLoading, isError, status, setStatus, pagination };
}
