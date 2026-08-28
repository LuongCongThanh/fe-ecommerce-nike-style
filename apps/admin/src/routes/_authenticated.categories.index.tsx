import { useMemo, useState } from 'react';

import { getProducts } from '@repo/api-sdk/endpoints/catalog';
import type { Category } from '@repo/schemas/catalog';
import { Badge } from '@repo/ui/badge';
import { Button } from '@repo/ui/button';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useAdminCategories } from '@/features/categories/useAdminCategories';
import { useDeleteCategory } from '@/features/categories/useCategoryMutations';
import { ConfirmDialog } from '@/features/shell/ConfirmDialog';
import { DataTable } from '@/features/shell/DataTable';
import { PageHeader } from '@/features/shell/PageHeader';
import { useClientDataTablePagination } from '@/features/shell/useClientDataTablePagination';

export const Route = createFileRoute('/_authenticated/categories/')({
  component: CategoriesPage,
});

const PAGE_SIZE = 20;

interface CategoryRow {
  readonly category: Category;
  readonly depth: number;
}

/** Depth-first flatten so children render indented directly under their parent, root categories first. */
function toTree(categories: Category[]): CategoryRow[] {
  const byParent = new Map<string | null, Category[]>();
  for (const category of categories) {
    const siblings = byParent.get(category.parentId) ?? [];
    siblings.push(category);
    byParent.set(category.parentId, siblings);
  }

  const rows: CategoryRow[] = [];
  const visit = (parentId: string | null, depth: number): void => {
    for (const category of byParent.get(parentId) ?? []) {
      rows.push({ category, depth });
      visit(category.id, depth + 1);
    }
  };
  visit(null, 0);
  return rows;
}

const columnHelper = createColumnHelper<CategoryRow>();

function CategoriesPage(): React.JSX.Element {
  const { t } = useTranslation('category');
  const { t: tCommon } = useTranslation('common');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const { data, isLoading, isError } = useAdminCategories();
  const deleteCategory = useDeleteCategory();
  // Real per-category product count, cross-referenced from the same catalog `getProducts()` the
  // dashboard's `ProductsSummary` uses — not a fabricated figure (no per-order revenue-by-category
  // aggregation exists), so this is what's honestly derivable.
  const { data: productsData } = useQuery({ queryKey: ['dashboard', 'products-summary'], queryFn: () => getProducts() });
  const productCountByCategory = new Map<string, number>();
  for (const product of productsData?.data ?? []) {
    productCountByCategory.set(product.categoryId, (productCountByCategory.get(product.categoryId) ?? 0) + 1);
  }

  const handleDelete = (id: string): void => {
    setDeleteError(null);
    deleteCategory.mutate(id, {
      onError: (error) => {
        setDeleteError(error instanceof Error ? error.message : t('deleteFallbackError'));
      },
    });
  };

  const allRows = data !== undefined ? toTree(data.data) : [];
  const { pageItems: pageRows, pagination } = useClientDataTablePagination(allRows, PAGE_SIZE, {
    pageOf: (page, totalPages) => tCommon('pagination.pageOf', { page, totalPages }),
    previous: tCommon('pagination.previous'),
    next: tCommon('pagination.next'),
  });

  /* eslint-disable react/no-unstable-nested-components -- these are TanStack column-def `header`/`cell` renderers, not
   * JSX-mounted nested components; the whole `columns` array is memoized below so their identity is stable across renders. */
  const columns = useMemo(
    () => [
      // Sorting stays off for every column here — row order is the depth-first tree walk from
      // `toTree`, and letting TanStack re-sort it would scramble parent/child adjacency.
      columnHelper.accessor((row) => row.category.name, {
        id: 'name',
        header: t('columns.name'),
        cell: ({ row }) => (
          <span className="font-medium" style={{ paddingLeft: `${String(row.original.depth * 1.5 + 1)}rem` }}>
            {row.original.category.name}
          </span>
        ),
      }),
      columnHelper.accessor((row) => row.category.slug, {
        id: 'slug',
        header: t('columns.slug'),
        cell: (info) => <span className="text-muted-foreground">{info.getValue()}</span>,
      }),
      columnHelper.display({
        id: 'productCount',
        header: t('columns.productCount'),
        cell: ({ row }) => <Badge variant="secondary">{productCountByCategory.get(row.original.category.id) ?? 0}</Badge>,
      }),
      columnHelper.display({
        id: 'actions',
        header: t('columns.actions'),
        meta: { className: 'text-right' },
        cell: ({ row }) => {
          const { category } = row.original;
          return (
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to="/categories/$id/edit" params={{ id: category.id }}>
                  {tCommon('actions.edit')}
                </Link>
              </Button>
              <ConfirmDialog
                trigger={
                  <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10" disabled={deleteCategory.isPending}>
                    {tCommon('actions.delete')}
                  </Button>
                }
                title={t('deleteTitle', { name: category.name })}
                description={tCommon('confirmIrreversible')}
                confirmLabel={tCommon('actions.delete')}
                loading={deleteCategory.isPending}
                onConfirm={() => {
                  handleDelete(category.id);
                }}
              />
            </div>
          );
        },
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps -- handleDelete/productCountByCategory are rebuilt every render off `data`/`deleteCategory`, already in this dep list via those
    [t, tCommon, productCountByCategory, deleteCategory.isPending],
  );
  /* eslint-enable react/no-unstable-nested-components */

  const table = useReactTable({
    data: pageRows,
    columns,
    enableSorting: false,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-4">
      <PageHeader
        title={t('title')}
        action={
          <Button asChild>
            <Link to="/categories/new">
              <Plus className="size-4" data-icon="inline-start" />
              {t('add')}
            </Link>
          </Button>
        }
      />

      {deleteError !== null ? (
        <p role="alert" className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-4 py-3 text-sm">
          {deleteError}
        </p>
      ) : null}

      <DataTable
        table={table}
        isLoading={isLoading}
        isError={isError}
        errorMessage={t('loadError')}
        isEmpty={pageRows.length === 0}
        emptyMessage={t('empty')}
        pagination={pagination}
      />
    </div>
  );
}
