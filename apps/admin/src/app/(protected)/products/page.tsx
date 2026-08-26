'use client';

import { useState } from 'react';
import Link from 'next/link';

import { Badge } from '@repo/ui/badge';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@repo/ui/table';
import { Plus } from 'lucide-react';

import { useAdminProducts } from '@/features/products/useAdminProducts';
import { useDeleteProduct } from '@/features/products/useProductMutations';
import { ConfirmDialog } from '@/features/shell/ConfirmDialog';

const PAGE_SIZE = 20;

export default function ProductsPage(): React.JSX.Element {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const { data, isLoading, isError } = useAdminProducts({ page, pageSize: PAGE_SIZE, search: search === '' ? undefined : search });
  const deleteProduct = useDeleteProduct();

  const handleDelete = (id: string): void => {
    setDeleteError(null);
    deleteProduct.mutate(id, {
      onError: (error) => {
        setDeleteError(error instanceof Error ? error.message : 'Không thể xoá sản phẩm này. Vui lòng thử lại.');
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Sản phẩm</h1>
        <Button asChild>
          <Link href="/products/new">
            <Plus className="size-4" data-icon="inline-start" />
            Thêm sản phẩm
          </Link>
        </Button>
      </div>

      <Input
        placeholder="Tìm kiếm sản phẩm..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        className="max-w-sm"
      />

      {deleteError !== null ? (
        <p role="alert" className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-4 py-3 text-sm">
          {deleteError}
        </p>
      ) : null}

      {isError ? (
        <p role="alert" className="text-destructive text-sm">
          Không thể tải danh sách sản phẩm.
        </p>
      ) : null}

      {isLoading ? <p className="text-muted-foreground text-sm">Đang tải...</p> : null}

      {data !== undefined ? (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên sản phẩm</TableHead>
                <TableHead>Danh mục</TableHead>
                <TableHead>Số biến thể</TableHead>
                <TableHead>Tồn kho</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{product.categoryId}</Badge>
                  </TableCell>
                  <TableCell>{product.skus.length}</TableCell>
                  <TableCell>{product.skus.reduce((sum, s) => sum + s.stock, 0)}</TableCell>
                  <TableCell className="flex justify-end gap-2 text-right">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/products/${product.id}/edit`}>Sửa</Link>
                    </Button>
                    <ConfirmDialog
                      trigger={
                        <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10" disabled={deleteProduct.isPending}>
                          Xoá
                        </Button>
                      }
                      title={`Xoá sản phẩm "${product.name}"?`}
                      description="Hành động này không thể hoàn tác."
                      confirmLabel="Xoá"
                      loading={deleteProduct.isPending}
                      onConfirm={() => {
                        handleDelete(product.id);
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {data.data.length === 0 ? <p className="text-muted-foreground p-6 text-center text-sm">Không có sản phẩm nào.</p> : null}
        </div>
      ) : null}

      {data !== undefined && data.meta.totalPages > 1 ? (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Trang {data.meta.page} / {data.meta.totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => {
                setPage((p) => p - 1);
              }}
            >
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= data.meta.totalPages}
              onClick={() => {
                setPage((p) => p + 1);
              }}
            >
              Sau
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
