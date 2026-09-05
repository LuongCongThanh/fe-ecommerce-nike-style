'use client';

import { use } from 'react';

import { Badge } from '@repo/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@repo/ui/table';
import { ImageIcon } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { OrderInfoCard } from '@/features/orders/OrderInfoCard';
import { OrderShippingTimeline } from '@/features/orders/OrderShippingTimeline';
import { OrderStatusActions } from '@/features/orders/OrderStatusActions';
import { orderStatusBadgeVariant } from '@/features/orders/orderStatusVariant';
import { useAdminOrder } from '@/features/orders/useAdminOrders';
import { PageHeader } from '@/features/shell/PageHeader';

export default function OrderDetailPage({ params }: { readonly params: Promise<{ id: string }> }): React.JSX.Element {
  const t = useTranslations('order');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const dateLocale = locale === 'en' ? 'en-US' : 'vi-VN';
  const { id } = use(params);
  const { data: order, isLoading, isError } = useAdminOrder(Number(id));

  return (
    <div className="space-y-6">
      <PageHeader title={t('detailTitle')} />

      {isLoading ? <p className="text-muted-foreground text-sm">{tCommon('loading')}</p> : null}
      {isError ? (
        <p role="alert" className="text-destructive text-sm">
          {t('loadOneError')}
        </p>
      ) : null}

      {order !== undefined ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold">{order.code}</p>
              <Badge variant={orderStatusBadgeVariant(order.status)}>{t(`statusLabels.${order.status}`)}</Badge>
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
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <span className="bg-muted flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md">
                            {item.image === '' ? (
                              <ImageIcon className="text-muted-foreground size-4" aria-hidden="true" />
                            ) : (
                              // eslint-disable-next-line @next/next/no-img-element -- product image comes from an arbitrary/mock URL, not the Next.js image pipeline's configured domains
                              <img src={item.image} alt="" className="size-full object-cover" />
                            )}
                          </span>
                          {item.product_name}
                        </div>
                      </TableCell>
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

          <div className="space-y-6">
            <OrderShippingTimeline order={order} />
            <OrderInfoCard order={order} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
