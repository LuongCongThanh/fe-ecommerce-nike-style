'use client';

import Link from 'next/link';

import { Badge } from '@repo/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@repo/ui/table';

import { useAdminOrders } from '@/features/orders/useAdminOrders';

export default function OrdersPage(): React.JSX.Element {
  const { data, isLoading, isError } = useAdminOrders();

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Đơn hàng</h1>

      {isError ? (
        <p role="alert" className="text-destructive text-sm">
          Không thể tải danh sách đơn hàng.
        </p>
      ) : null}
      {isLoading ? <p className="text-muted-foreground text-sm">Đang tải...</p> : null}

      {data !== undefined ? (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã đơn</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Tổng tiền</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.code}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{order.status}</Badge>
                  </TableCell>
                  <TableCell>{order.total.toLocaleString('vi-VN')}₫</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{new Date(order.created_at).toLocaleDateString('vi-VN')}</TableCell>
                  <TableCell className="text-right">
                    <Link href={`/orders/${String(order.id)}`} className="text-primary text-sm underline-offset-2 hover:underline">
                      Xem chi tiết
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {data.length === 0 ? <p className="text-muted-foreground p-6 text-center text-sm">Không có đơn hàng nào.</p> : null}
        </div>
      ) : null}
    </div>
  );
}
