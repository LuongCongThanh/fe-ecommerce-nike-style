'use client';

import { Table, TableBody, TableHead, TableHeader, TableRow } from '@repo/ui/table';

import { InventoryAuditLog } from '@/features/inventory/InventoryAuditLog';
import { InventoryRow } from '@/features/inventory/InventoryRow';
import { useAdminInventory } from '@/features/inventory/useAdminInventory';

export default function InventoryPage(): React.JSX.Element {
  const { data, isLoading, isError } = useAdminInventory();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold">Tồn kho</h1>

        {isError ? (
          <p role="alert" className="text-destructive mt-2 text-sm">
            Không thể tải danh sách tồn kho.
          </p>
        ) : null}
        {isLoading ? <p className="text-muted-foreground mt-2 text-sm">Đang tải...</p> : null}

        {data !== undefined ? (
          <div className="mt-4 rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sản phẩm</TableHead>
                  <TableHead>Biến thể</TableHead>
                  <TableHead>Tồn kho thực tế (on_hand)</TableHead>
                  <TableHead>Đang giữ (reserved)</TableHead>
                  <TableHead>Khả dụng (available)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((item) => (
                  <InventoryRow key={item.skuId} item={item} />
                ))}
              </TableBody>
            </Table>
            {data.data.length === 0 ? <p className="text-muted-foreground p-6 text-center text-sm">Không có biến thể nào.</p> : null}
          </div>
        ) : null}
      </div>

      <InventoryAuditLog />
    </div>
  );
}
