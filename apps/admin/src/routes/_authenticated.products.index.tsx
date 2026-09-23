import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@repo/ui/tooltip';
import { createFileRoute, Link } from '@tanstack/react-router';
import { Download, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { ALL_CATEGORIES, ALL_STOCK, PRODUCT_PAGE_SIZE_OPTIONS, useProductList } from '@/features/products/useProductList';
import { ConfirmDialog } from '@/shell/ConfirmDialog';
import { DataTable } from '@/shell/DataTable';
import { PageHeader } from '@/shell/PageHeader';

export const Route = createFileRoute('/_authenticated/products/')({
  component: ProductsPage,
});

function ProductsPage(): React.JSX.Element {
  const { t } = useTranslation('product');
  const { t: tCommon } = useTranslation('common');
  const list = useProductList();

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <PageHeader
          title={t('title')}
          action={
            <Button asChild>
              <Link to="/products/new">
                <Plus className="size-4" data-icon="inline-start" />
                {t('add')}
              </Link>
            </Button>
          }
        />

        <div className="flex flex-wrap gap-3">
          <Select value={list.categoryFilter} onValueChange={list.setCategoryFilter}>
            <SelectTrigger className="w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_CATEGORIES}>{t('filterAllCategories')}</SelectItem>
              {list.categoryOptions.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={list.stockFilter} onValueChange={list.setStockFilter}>
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
            value={list.search}
            onChange={(e) => {
              list.setSearch(e.target.value);
            }}
            className="max-w-sm"
          />

          <div className="flex items-center gap-3">
            {list.selectedIds.length > 0 ? (
              <>
                <span className="text-muted-foreground text-sm">{t('selectedCount', { count: list.selectedIds.length })}</span>
                <ConfirmDialog
                  trigger={
                    <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10" disabled={list.isDeleting}>
                      {t('deleteSelected')}
                    </Button>
                  }
                  title={t('deleteSelectedTitle', { count: list.selectedIds.length })}
                  description={tCommon('confirmIrreversible')}
                  confirmLabel={tCommon('actions.delete')}
                  loading={list.isDeleting}
                  onConfirm={list.deleteSelected}
                />
              </>
            ) : null}

            <Select
              value={String(list.pageSize)}
              onValueChange={(value) => {
                list.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="w-24" aria-label={t('pageSizeLabel')}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_PAGE_SIZE_OPTIONS.map((size) => (
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

        {list.deleteError !== null ? (
          <p role="alert" className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-4 py-3 text-sm">
            {list.deleteError}
          </p>
        ) : null}

        <DataTable
          table={list.table}
          isLoading={list.isLoading}
          isError={list.isError}
          errorMessage={t('loadError')}
          isEmpty={list.rows.length === 0}
          emptyMessage={t('empty')}
          pagination={list.pagination}
        />
      </div>
    </TooltipProvider>
  );
}
