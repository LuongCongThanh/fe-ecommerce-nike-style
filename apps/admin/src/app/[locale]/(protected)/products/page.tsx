'use client';

import { useMemo, useState } from 'react';

import type { Product } from '@repo/schemas/catalog';
import { Badge } from '@repo/ui/badge';
import { Button } from '@repo/ui/button';
import { Checkbox } from '@repo/ui/checkbox';
import { Input } from '@repo/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@repo/ui/tooltip';
import type { RowSelectionState, SortingState } from '@tanstack/react-table';
import { createColumnHelper, getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { Download, ImageIcon, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

import { useAdminCategories } from '@/features/categories/useAdminCategories';
import { useAdminProducts } from '@/features/products/useAdminProducts';
import { useDeleteProduct } from '@/features/products/useProductMutations';
import { ConfirmDialog } from '@/features/shell/ConfirmDialog';
import { DataTable } from '@/features/shell/DataTable';
import { PageHeader } from '@/features/shell/PageHeader';
import { useUrlPage } from '@/features/shell/useUrlPage';

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;
/** "All" sentinels — `undefined` (not `''`, which Radix Select's item can't hold as a value). */
const ALL_CATEGORIES = 'all';
const ALL_STOCK = 'all';

/** One table row's worth of pre-computed view data — TanStack Table columns read off this instead of
 * re-deriving totalStock/minPrice/skuLabel per cell render. */
interface ProductRow {
  readonly product: Product;
  readonly totalStock: number;
  readonly minPrice: number;
  readonly skuLabel: string;
}

const columnHelper = createColumnHelper<ProductRow>();

export default function ProductsPage(): React.JSX.Element {
  const t = useTranslations('product');
  const tCommon = useTranslations('common');
  const { page, setPage } = useUrlPage();
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZE_OPTIONS[1]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(ALL_CATEGORIES);
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

  const categoryNameById = new Map((categories.data?.data ?? []).map((category) => [category.id, category.name]));

  // Stock is real (Σ sku.stock) but filters only the already-fetched server page, since it isn't a
  // real server-side query param (category is; see useAdminProducts above) — `stockFilterActive`
  // below hides pagination while this filter is on, since `data.meta.totalPages` describes the
  // *unfiltered* server page count and would otherwise contradict what's rendered (code review on
  // PR #74: filtering could show an empty page while Next stays enabled for more unfiltered pages).
  const stockFilterActive = stockFilter !== ALL_STOCK;
  const rows: ProductRow[] = (data?.data ?? [])
    .map((product) => {
      const totalStock = product.skus.reduce((sum, s) => sum + s.stock, 0);
      const minPrice = Math.min(...product.skus.map((s) => s.price));
      const skuLabel = product.skus.length === 1 ? product.skus[0]?.id : `${product.skus[0]?.id ?? ''} +${String(product.skus.length - 1)}`;
      return { product, totalStock, minPrice, skuLabel };
    })
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

  const handleDeleteSelected = (): void => {
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

  /* eslint-disable react/no-unstable-nested-components -- these are TanStack column-def `header`/`cell` renderers, not
   * JSX-mounted nested components; the whole `columns` array is memoized below so their identity is stable across renders. */
  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'select',
        meta: { className: 'w-10' },
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllRowsSelected()}
            onCheckedChange={(checked) => {
              table.toggleAllRowsSelected(checked === true);
            }}
            aria-label={t('selectedCount', { count: table.getSelectedRowModel().rows.length })}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(checked) => {
              row.toggleSelected(checked === true);
            }}
            aria-label={row.original.product.name}
          />
        ),
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
                  // eslint-disable-next-line @next/next/no-img-element -- product image comes from a mock CDN URL, not the Next.js image pipeline's configured domains
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
            </div>
          );
        },
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps -- categoryNameById/handleDelete are rebuilt every render off `data`/`deleteProduct`, already in this dep list via those
    [t, tCommon, categoryNameById, deleteProduct.isPending],
  );
  /* eslint-enable react/no-unstable-nested-components */

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

  return (
    <TooltipProvider>
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

        <div className="flex flex-wrap gap-3">
          <Select
            value={categoryFilter}
            onValueChange={(value) => {
              setCategoryFilter(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_CATEGORIES}>{t('filterAllCategories')}</SelectItem>
              {(categories.data?.data ?? []).map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={stockFilter} onValueChange={setStockFilter}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_STOCK}>{t('filterAllStock')}</SelectItem>
              <SelectItem value="inStock">{t('stockStatus.inStock')}</SelectItem>
              <SelectItem value="outOfStock">{t('stockStatus.outOfStock')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Input
            placeholder={t('searchPlaceholder')}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="max-w-sm"
          />

          <div className="flex items-center gap-3">
            {selectedIds.length > 0 ? (
              <>
                <span className="text-muted-foreground text-sm">{t('selectedCount', { count: selectedIds.length })}</span>
                <ConfirmDialog
                  trigger={
                    <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10" disabled={deleteProduct.isPending}>
                      {t('deleteSelected')}
                    </Button>
                  }
                  title={t('deleteSelectedTitle', { count: selectedIds.length })}
                  description={tCommon('confirmIrreversible')}
                  confirmLabel={tCommon('actions.delete')}
                  loading={deleteProduct.isPending}
                  onConfirm={handleDeleteSelected}
                />
              </>
            ) : null}

            <Select
              value={String(pageSize)}
              onValueChange={(value) => {
                setPageSize(Number(value));
                setPage(1);
              }}
            >
              <SelectTrigger className="w-24" aria-label={t('pageSizeLabel')}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button variant="outline" disabled>
                    <Download className="size-4" data-icon="inline-start" />
                    {t('export')}
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>{tCommon('notAvailableYet')}</TooltipContent>
            </Tooltip>
          </div>
        </div>

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
          isEmpty={rows.length === 0}
          emptyMessage={t('empty')}
          pagination={
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
                  label: tCommon('pagination.pageOf', { page: data.meta.page, totalPages: data.meta.totalPages }),
                  previousLabel: tCommon('pagination.previous'),
                  nextLabel: tCommon('pagination.next'),
                }
              : undefined
          }
        />
      </div>
    </TooltipProvider>
  );
}
