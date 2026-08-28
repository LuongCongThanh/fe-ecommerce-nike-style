import { Badge } from '@repo/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@repo/ui/table';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { useAdminOrders } from '@/features/orders/useAdminOrders';

export const Route = createFileRoute('/_authenticated/orders/')({
  component: OrdersPage,
});

function OrdersPage(): React.JSX.Element {
  const { t, i18n } = useTranslation('order');
  const { t: tCommon } = useTranslation('common');
  const dateLocale = i18n.language === 'en' ? 'en-US' : 'vi-VN';
  const { data, isLoading, isError } = useAdminOrders();

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">{t('title')}</h1>

      {isError ? (
        <p role="alert" className="text-destructive text-sm">
          {t('loadError')}
        </p>
      ) : null}
      {isLoading ? <p className="text-muted-foreground text-sm">{tCommon('loading')}</p> : null}

      {data !== undefined ? (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('columns.code')}</TableHead>
                <TableHead>{t('columns.status')}</TableHead>
                <TableHead>{t('columns.total')}</TableHead>
                <TableHead>{t('columns.createdAt')}</TableHead>
                <TableHead className="text-right">{t('columns.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.code}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{order.status}</Badge>
                  </TableCell>
                  <TableCell>{order.total.toLocaleString(dateLocale)}₫</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{new Date(order.created_at).toLocaleDateString(dateLocale)}</TableCell>
                  <TableCell className="text-right">
                    <Link to="/orders/$id" params={{ id: String(order.id) }} className="text-primary text-sm underline-offset-2 hover:underline">
                      {t('viewDetail')}
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {data.length === 0 ? <p className="text-muted-foreground p-6 text-center text-sm">{t('empty')}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
