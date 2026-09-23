import { useMemo, useState } from 'react';

import type { Product } from '@repo/schemas/catalog';
import { Badge } from '@repo/ui/badge';
import { Button } from '@repo/ui/button';
import { Link } from '@tanstack/react-router';
import type { RowSelectionState, SortingState, Table } from '@tanstack/react-table';
import { createColumnHelper, getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { ImageIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useAdminCategories } from '@/features/categories/useAdminCategories';
import { useAdminProducts } from '@/features/products/useAdminProducts';
import { useDeleteProduct } from '@/features/products/useProductMutations';
import { ConfirmDialog } from '@/shell/ConfirmDialog';
import type { DataTablePagination } from '@/shell/DataTable';
import { selectColumn } from '@/shell/selectColumn';
import { usePaginationLabels } from '@/shell/usePaginationLabels';
import { useUrlPage } from '@/shell/useUrlPage';

export const PRODUCT_PAGE_SIZE_OPTIONS = [10, 20, 50] as const;
/** "All" sentinels — `undefined` (not `''`, which Radix Select's item can't hold as a value). */
export const ALL_CATEGORIES = 'all';
export const ALL_STOCK = 'all';

/** One table row's worth of pre-computed view data — TanStack Table columns read off this instead of
 * re-deriving totalStock/minPrice/skuLabel per cell render. */
export interface ProductRow {
  readonly product: Product;
  readonly totalStock: number;
  readonly minPrice: number;
  readonly skuLabel: string;
}

export interface ProductCategoryOption {
  readonly id: string;
  readonly name: string;
}

export interface ProductListModel {
  readonly table: Table<ProductRow>;
  readonly rows: ProductRow[];
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly categoryOptions: readonly ProductCategoryOption[];
  readonly categoryFilter: string;
  readonly setCategoryFilter: (value: string) => void;
  readonly stockFilter: string;
  readonly setStockFilter: (value: string) => void;
  readonly search: string;
  readonly setSearch: (value: string) => void;
  readonly pageSize: number;
  readonly setPageSize: (value: number) => void;
  readonly selectedIds: string[];
  readonly deleteError: string | null;
  readonly isDeleting: boolean;
  readonly deleteSelected: () => void;
  /** `undefined` while the client-only stock filter is on — see the note on `stockFilterActive` below. */
  readonly pagination: DataTablePagination | undefined;
}

const columnHelper = createColumnHelper<ProductRow>();

/** Σ sku.stock, min(sku.price) and the "first sku +N" label, derived once per product per render. */
function toRow(product: Product): ProductRow {
  const totalStock = product.skus.reduce((sum, s) => sum + s.stock, 0);
  const minPrice = Math.min(...product.skus.map((s) => s.price));
  const skuLabel = product.skus.length === 1 ? (product.skus[0]?.id ?? '') : `${product.skus[0]?.id ?? ''} +${String(product.skus.length - 1)}`;
  return { product, totalStock, minPrice, skuLabel };
}

/**
 * Everything the products list page is, behind one interface: server query + filters, the
 * `ProductRow` view-model derivation, delete handling, and the TanStack table. The route renders it;
 * it owns no logic of its own.
 */
export function useProductList(): ProductListModel {
  const { t } = useTranslation('product');
  const { t: tCommon } = useTranslation('common');
  const paginationLabels = usePaginationLabels();
  const { page, setPage } = useUrlPage();
  const [pageSize, setPageSizeState] = useState<number>(PRODUCT_PAGE_SIZE_OPTIONS[1]);
  const [search, setSearchState] = useState('');
  const [categoryFilter, setCategoryFilterState] = useState(ALL_CATEGORIES);
  const [stockFilter, setStockFilter] = useState(ALL_STOCK);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const categories = useAdminCategories();
  const { data, isLoading, isError } = useAdminProducts({
    page,
    pageSize,
    search: search === '' ? undefined : search,
    category: categoryFilter === ALL_CATEGORIES ? undefined : categoryFilter,
  });
  const deleteProduct = useDeleteProduct();

  const categoryOptions: ProductCategoryOption[] = (categories.data?.data ?? []).map((category) => ({ id: category.id, name: category.name }));
  const categoryNameById = new Map(categoryOptions.map((category) => [category.id, category.name]));

  // Stock is real (Σ sku.stock) but filters only the already-fetched server page, since it isn't a
  // real server-side query param (category is; see useAdminProducts above) — `stockFilterActive`
  // below drops pagination while this filter is on, since `data.meta.totalPages` describes the
  // *unfiltered* server page count and would otherwise contradict what's rendered.
  const stockFilterActive = stockFilter !== ALL_STOCK;
  const rows: ProductRow[] = (data?.data ?? [])
    .map(toRow)
    .filter(({ totalStock }) => !stockFilterActive || (stockFilter === 'inStock') === totalStock > 0);

  const selectedIds = Object.keys(rowSelection).filter((id) => rowSelection[id]);

  const handleDelete = (id: string): void => {
    setDeleteError(null);
    deleteProduct.mutate(id, {
      onError: (error) => {
        setDeleteError(error instanceof Error ? error.message : t('deleteFallbackError'));
      },
    });
  };

  const deleteSelected = (): void => {
    setDeleteError(null);
    for (const id of selectedIds) {
      deleteProduct.mutate(id, {
        onError: (error) => {
          setDeleteError(error instanceof Error ? error.message : t('deleteFallbackError'));
        },
      });
    }
    setRowSelection({});
  };

  const columns = useMemo(
    () => [
      selectColumn<ProductRow>({
        selectAllLabel: (count) => t('selectedCount', { count }),
        rowLabel: (row) => row.product.name,
      }),
      columnHelper.accessor((row) => row.product.name, {
        id: 'name',
        header: t('columns.name'),
        cell: ({ row }) => {
          const { product } = row.original;
          const thumbnail = product.images.at(0);
          return (
            <div className="flex items-center gap-3">
              <span className="bg-muted flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md">
                {thumbnail === undefined ? (
                  <ImageIcon className="text-muted-foreground size-4" aria-hidden="true" />
                ) : (
                  <img src={thumbnail} alt="" className="size-full object-cover" />
                )}
              </span>
              <div className="min-w-0">
                <p className="truncate font-medium">{product.name}</p>
                <p className="text-muted-foreground truncate text-xs">{product.description}</p>
              </div>
            </div>
          );
        },
      }),
      columnHelper.display({
        id: 'category',
        header: t('columns.category'),
        cell: ({ row }) => (
          <Badge variant="outline">{categoryNameById.get(row.original.product.categoryId) ?? row.original.product.categoryId}</Badge>
        ),
      }),
      columnHelper.accessor((row) => row.skuLabel, {
        id: 'sku',
        header: t('columns.sku'),
        enableSorting: false,
        cell: (info) => <span className="text-muted-foreground font-mono text-xs">{info.getValue()}</span>,
      }),
      columnHelper.accessor((row) => row.totalStock, {
        id: 'stockStatus',
        header: t('columns.stock'),
        enableSorting: false,
        cell: (info) => (
          <Badge variant={info.getValue() > 0 ? 'success' : 'destructive'}>
            {info.getValue() > 0 ? t('stockStatus.inStock') : t('stockStatus.outOfStock')}
          </Badge>
        ),
      }),
      columnHelper.accessor((row) => row.totalStock, {
        id: 'qty',
        header: t('columns.qty'),
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor((row) => row.minPrice, {
        id: 'price',
        header: t('columns.price'),
        cell: (info) => `${info.getValue().toLocaleString()}₫`,
      }),
      columnHelper.display({
        id: 'actions',
        header: t('columns.actions'),
        meta: { className: 'text-right' },
        cell: ({ row }) => {
          const { product } = row.original;
          return (
            <div className="flex justify-end gap-2">
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
            </div>
          );
        },
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps -- categoryNameById/handleDelete are rebuilt every render off `data`/`deleteProduct`, already in this dep list via those
    [t, tCommon, categoryNameById, deleteProduct.isPending],
  );

  const table = useReactTable({
    data: rows,
    columns,
    getRowId: (row) => row.product.id,
    state: { rowSelection, sorting },
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // Changing any filter invalidates the current page number, so each setter resets it to 1.
  const setSearch = (value: string): void => {
    setSearchState(value);
    setPage(1);
  };
  const setCategoryFilter = (value: string): void => {
    setCategoryFilterState(value);
    setPage(1);
  };
  const setPageSize = (value: number): void => {
    setPageSizeState(value);
    setPage(1);
  };

  return {
    table,
    rows,
    isLoading,
    isError,
    categoryOptions,
    categoryFilter,
    setCategoryFilter,
    stockFilter,
    setStockFilter,
    search,
    setSearch,
    pageSize,
    setPageSize,
    selectedIds,
    deleteError,
    isDeleting: deleteProduct.isPending,
    deleteSelected,
    pagination:
      data !== undefined && !stockFilterActive
        ? {
            page,
            totalPages: data.meta.totalPages,
            onPrevious: () => {
              setPage(page - 1);
            },
            onNext: () => {
              setPage(page + 1);
            },
            onPageChange: setPage,
            label: paginationLabels.pageOf(data.meta.page, data.meta.totalPages),
            previousLabel: paginationLabels.previous,
            nextLabel: paginationLabels.next,
          }
        : undefined,
  };
}
