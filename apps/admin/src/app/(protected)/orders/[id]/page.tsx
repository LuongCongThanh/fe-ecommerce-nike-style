'use client';

import { use } from 'react';

import { Badge } from '@repo/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@repo/ui/table';

import { OrderStatusActions } from '@/features/orders/OrderStatusActions';
import { useAdminOrder } from '@/features/orders/useAdminOrders';

export default function OrderDetailPage({ params }: { readonly params: Promise<{ id: string }> }): React.JSX.Element {
  const { id } = use(params);
  const { data: order, isLoading, isError } = useAdminOrder(Number(id));

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-xl font-bold">Chi tiết đơn hàng</h1>

      {isLoading ? <p className="text-muted-foreground text-sm">Đang tải...</p> : null}
      {isError ? (
        <p role="alert" className="text-destructive text-sm">
          Không thể tải đơn hàng.
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
                  <TableHead>Sản phẩm</TableHead>
                  <TableHead>Biến thể</TableHead>
                  <TableHead>Số lượng</TableHead>
                  <TableHead className="text-right">Thành tiền</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.product_name}</TableCell>
                    <TableCell>{item.variant_name === '' ? '—' : item.variant_name}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell className="text-right">{item.subtotal.toLocaleString('vi-VN')}₫</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="text-right text-sm">
            <p>Tạm tính: {order.subtotal.toLocaleString('vi-VN')}₫</p>
            <p>Phí vận chuyển: {order.shipping_fee.toLocaleString('vi-VN')}₫</p>
            <p className="font-semibold">Tổng cộng: {order.total.toLocaleString('vi-VN')}₫</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
