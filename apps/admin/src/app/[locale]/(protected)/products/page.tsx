'use client';

import { useState } from 'react';

import { Badge } from '@repo/ui/badge';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { TableCell, TableRow } from '@repo/ui/table';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

import { useAdminProducts } from '@/features/products/useAdminProducts';
import { useDeleteProduct } from '@/features/products/useProductMutations';
import { ConfirmDialog } from '@/features/shell/ConfirmDialog';
import { DataTable } from '@/features/shell/DataTable';
import { PageHeader } from '@/features/shell/PageHeader';

const PAGE_SIZE = 20;

export default function ProductsPage(): React.JSX.Element {
  const t = useTranslations('product');
  const tCommon = useTranslations('common');
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
      <PageHeader
        title={t('title')}
        action={
          <Button asChild>
            <Link href="/products/new">
              <Plus className="size-4" data-icon="inline-start" />
              {t('add')}
            </Link>
          </Button>
        }
      />

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

      <DataTable
        headers={[t('columns.name'), t('columns.category'), t('columns.variantCount'), t('columns.stock'), t('columns.actions')]}
        isLoading={isLoading}
        isError={isError}
        errorMessage={t('loadError')}
        isEmpty={(data?.data.length ?? 0) === 0}
        emptyMessage={t('empty')}
        pagination={
          data !== undefined
            ? {
                page,
                totalPages: data.meta.totalPages,
                onPrevious: () => {
                  setPage((p) => p - 1);
                },
                onNext: () => {
                  setPage((p) => p + 1);
                },
                label: tCommon('pagination.pageOf', { page: data.meta.page, totalPages: data.meta.totalPages }),
                previousLabel: tCommon('pagination.previous'),
                nextLabel: tCommon('pagination.next'),
              }
            : undefined
        }
      >
        {(data?.data ?? []).map((product) => (
          <TableRow key={product.id}>
            <TableCell className="font-medium">{product.name}</TableCell>
            <TableCell>
              <Badge variant="outline">{product.categoryId}</Badge>
            </TableCell>
            <TableCell>{product.skus.length}</TableCell>
            <TableCell>{product.skus.reduce((sum, s) => sum + s.stock, 0)}</TableCell>
            <TableCell className="flex justify-end gap-2 text-right">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/products/${product.id}/edit`}>{tCommon('actions.edit')}</Link>
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
      </DataTable>
    </div>
  );
}
