import { useMemo, useState } from 'react';

import type { Category } from '@repo/schemas/catalog';
import { Badge } from '@repo/ui/badge';
import { Button } from '@repo/ui/button';
import { Link } from '@tanstack/react-router';
import type { Table } from '@tanstack/react-table';
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';

import { useAdminCategories } from '@/features/categories/useAdminCategories';
import { useDeleteCategory } from '@/features/categories/useCategoryMutations';
import { useCatalogProducts } from '@/features/products/useCatalogProducts';
import { ConfirmDialog } from '@/shell/ConfirmDialog';
import type { DataTablePagination } from '@/shell/DataTable';
import { filterBySearch } from '@/shell/filterBySearch';
import { useClientDataTablePagination } from '@/shell/useClientDataTablePagination';
import { usePaginationLabels } from '@/shell/usePaginationLabels';

const PAGE_SIZE = 20;

export interface CategoryRow {
  readonly category: Category;
  readonly depth: number;
}

export interface CategoryListModel {
  readonly table: Table<CategoryRow>;
  readonly pageRows: CategoryRow[];
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly search: string;
  readonly setSearch: (value: string) => void;
  readonly deleteError: string | null;
  readonly pagination: DataTablePagination;
}

/** Depth-first flatten so children render indented directly under their parent, root categories first. */
export function toTree(categories: Category[]): CategoryRow[] {
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

/**
 * The category list behind one interface: the tree flatten, the per-category product count
 * cross-reference, search, delete handling and pagination. The route only renders it.
 */
export function useCategoryList(): CategoryListModel {
  const { t } = useTranslation('category');
  const { t: tCommon } = useTranslation('common');
  const paginationLabels = usePaginationLabels();
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const { data, isLoading, isError } = useAdminCategories();
  const deleteCategory = useDeleteCategory();
  // Real per-category product count, cross-referenced from the same catalog products the dashboard's
  // `ProductsSummary` reads — not a fabricated figure (no per-order revenue-by-category aggregation
  // exists), so this is what's honestly derivable.
  const { data: productsData } = useCatalogProducts();
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

  const allRows = filterBySearch(data !== undefined ? toTree(data.data) : [], search, [(row) => row.category.name, (row) => row.category.slug]);
  const { pageItems: pageRows, pagination } = useClientDataTablePagination(allRows, PAGE_SIZE, paginationLabels);

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

  const table = useReactTable({
    data: pageRows,
    columns,
    enableSorting: false,
    getCoreRowModel: getCoreRowModel(),
  });

  return { table, pageRows, isLoading, isError, search, setSearch, deleteError, pagination };
}
