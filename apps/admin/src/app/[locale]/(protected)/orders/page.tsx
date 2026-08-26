'use client';

import { useState } from 'react';

import { Badge } from '@repo/ui/badge';
import { TableCell, TableRow } from '@repo/ui/table';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

import { useAdminOrders } from '@/features/orders/useAdminOrders';
import { DataTable } from '@/features/shell/DataTable';
import { PageHeader } from '@/features/shell/PageHeader';

const PAGE_SIZE = 20;

export default function OrdersPage(): React.JSX.Element {
  const t = useTranslations('order');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const dateLocale = locale === 'en' ? 'en-US' : 'vi-VN';
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useAdminOrders();

  const allOrders = data ?? [];
  const totalPages = Math.max(1, Math.ceil(allOrders.length / PAGE_SIZE));
  const pageOrders = allOrders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-4">
      <PageHeader title={t('title')} />

      <DataTable
        headers={[t('columns.code'), t('columns.status'), t('columns.total'), t('columns.createdAt'), t('columns.actions')]}
        isLoading={isLoading}
        isError={isError}
        errorMessage={t('loadError')}
        isEmpty={pageOrders.length === 0}
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
        {pageOrders.map((order) => (
          <TableRow key={order.id}>
            <TableCell className="font-medium">{order.code}</TableCell>
            <TableCell>
              <Badge variant="outline">{order.status}</Badge>
            </TableCell>
            <TableCell>{order.total.toLocaleString(dateLocale)}₫</TableCell>
            <TableCell className="text-muted-foreground text-xs">{new Date(order.created_at).toLocaleDateString(dateLocale)}</TableCell>
            <TableCell className="text-right">
              <Link href={`/orders/${String(order.id)}`} className="text-primary text-sm underline-offset-2 hover:underline">
                {t('viewDetail')}
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </DataTable>
    </div>
  );
}
