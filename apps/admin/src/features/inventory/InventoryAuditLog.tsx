'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@repo/ui/table';

import { useAdminInventoryAuditLog } from './useAdminInventory';

/** Shows every on_hand change (newest first) with the actor and before/after values (issue #21's
 * acceptance criteria — "audit-friendly", actor + timestamp). */
export function InventoryAuditLog(): React.JSX.Element {
  const { data, isLoading, isError } = useAdminInventoryAuditLog();

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold">Lịch sử thay đổi tồn kho</h2>

      {isError ? (
        <p role="alert" className="text-destructive text-sm">
          Không thể tải lịch sử thay đổi.
        </p>
      ) : null}
      {isLoading ? <p className="text-muted-foreground text-sm">Đang tải...</p> : null}

      {data !== undefined ? (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Trước</TableHead>
                <TableHead>Sau</TableHead>
                <TableHead>Người thực hiện</TableHead>
                <TableHead>Thời gian</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-mono text-xs">{entry.skuId}</TableCell>
                  <TableCell>{entry.previousOnHand}</TableCell>
                  <TableCell>{entry.newOnHand}</TableCell>
                  <TableCell>{entry.actorName}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{new Date(entry.at).toLocaleString('vi-VN')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {data.data.length === 0 ? <p className="text-muted-foreground p-6 text-center text-sm">Chưa có thay đổi nào.</p> : null}
        </div>
      ) : null}
    </div>
  );
}
