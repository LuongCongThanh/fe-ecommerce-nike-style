import { useState } from 'react';

import { Badge } from '@repo/ui/badge';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@repo/ui/table';
import { createFileRoute, Link } from '@tanstack/react-router';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useAdminProducts } from '@/features/products/useAdminProducts';
import { useDeleteProduct } from '@/features/products/useProductMutations';
import { ConfirmDialog } from '@/features/shell/ConfirmDialog';

const PAGE_SIZE = 20;

export const Route = createFileRoute('/_authenticated/products/')({
  component: ProductsPage,
});

function ProductsPage(): React.JSX.Element {
  const { t } = useTranslation('product');
  const { t: tCommon } = useTranslation('common');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const { data, isLoading, isError } = useAdminProducts({ page, pageSize: PAGE_SIZE, search: search === '' ? undefined : search });
  const deleteProduct = useDeleteProduct();

  const handleDelete = (id: string): void => {
    setDeleteError(null);
    deleteProduct.mutate(id, {
      onError: (error) => {
        setDeleteError(error instanceof Error ? error.message : t('deleteFallbackError'));
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{t('title')}</h1>
        <Button asChild>
          <Link to="/products/new">
            <Plus className="size-4" data-icon="inline-start" />
            {t('add')}
          </Link>
        </Button>
      </div>

      <Input
        placeholder={t('searchPlaceholder')}
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
          {t('loadError')}
        </p>
      ) : null}

      {isLoading ? <p className="text-muted-foreground text-sm">{tCommon('loading')}</p> : null}

      {data !== undefined ? (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('columns.name')}</TableHead>
                <TableHead>{t('columns.category')}</TableHead>
                <TableHead>{t('columns.variantCount')}</TableHead>
                <TableHead>{t('columns.stock')}</TableHead>
                <TableHead className="text-right">{t('columns.actions')}</TableHead>
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
                      <Link to="/products/$id/edit" params={{ id: product.id }}>
                        {tCommon('actions.edit')}
                      </Link>
                    </Button>
                    <ConfirmDialog
                      trigger={
                        <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10" disabled={deleteProduct.isPending}>
                          {tCommon('actions.delete')}
                        </Button>
                      }
                      title={t('deleteTitle', { name: product.name })}
                      description={tCommon('confirmIrreversible')}
                      confirmLabel={tCommon('actions.delete')}
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
          {data.data.length === 0 ? <p className="text-muted-foreground p-6 text-center text-sm">{t('empty')}</p> : null}
        </div>
      ) : null}

      {data !== undefined && data.meta.totalPages > 1 ? (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{tCommon('pagination.pageOf', { page: data.meta.page, totalPages: data.meta.totalPages })}</span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => {
                setPage((p) => p - 1);
              }}
            >
              {tCommon('pagination.previous')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= data.meta.totalPages}
              onClick={() => {
                setPage((p) => p + 1);
              }}
            >
              {tCommon('pagination.next')}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
