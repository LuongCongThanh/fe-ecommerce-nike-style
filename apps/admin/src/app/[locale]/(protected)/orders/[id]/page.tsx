'use client';

import { use } from 'react';

import { Badge } from '@repo/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@repo/ui/table';
import { useLocale, useTranslations } from 'next-intl';

import { OrderStatusActions } from '@/features/orders/OrderStatusActions';
import { useAdminOrder } from '@/features/orders/useAdminOrders';

export default function OrderDetailPage({ params }: { readonly params: Promise<{ id: string }> }): React.JSX.Element {
  const t = useTranslations('order');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const dateLocale = locale === 'en' ? 'en-US' : 'vi-VN';
  const { id } = use(params);
  const { data: order, isLoading, isError } = useAdminOrder(Number(id));

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-xl font-bold">{t('detailTitle')}</h1>

      {isLoading ? <p className="text-muted-foreground text-sm">{tCommon('loading')}</p> : null}
      {isError ? (
        <p role="alert" className="text-destructive text-sm">
          {t('loadOneError')}
        </p>
      ) : null}

      {order !== undefined ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold">{order.code}</p>
              <p className="text-muted-foreground text-sm">{order.address}</p>
            </div>
            <Badge variant="outline">{order.status}</Badge>
          </div>

          <OrderStatusActions order={order} />

          <div className="rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('columns.product')}</TableHead>
                  <TableHead>{t('columns.variant')}</TableHead>
                  <TableHead>{t('columns.quantity')}</TableHead>
                  <TableHead className="text-right">{t('columns.subtotal')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.product_name}</TableCell>
                    <TableCell>{item.variant_name === '' ? '—' : item.variant_name}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell className="text-right">{item.subtotal.toLocaleString(dateLocale)}₫</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="text-right text-sm">
            <p>{t('summary.subtotal', { value: order.subtotal.toLocaleString(dateLocale) })}</p>
            <p>{t('summary.shippingFee', { value: order.shipping_fee.toLocaleString(dateLocale) })}</p>
            <p className="font-semibold">{t('summary.total', { value: order.total.toLocaleString(dateLocale) })}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
