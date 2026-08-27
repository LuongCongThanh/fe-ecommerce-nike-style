'use client';

import { useState } from 'react';

import type { Category } from '@repo/schemas/catalog';
import { Button } from '@repo/ui/button';
import { TableCell, TableRow } from '@repo/ui/table';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

import { useAdminCategories } from '@/features/categories/useAdminCategories';
import { useDeleteCategory } from '@/features/categories/useCategoryMutations';
import { useClientDataTablePagination } from '@/features/shell/useClientDataTablePagination';
import { ConfirmDialog } from '@/features/shell/ConfirmDialog';
import { DataTable } from '@/features/shell/DataTable';
import { PageHeader } from '@/features/shell/PageHeader';

const PAGE_SIZE = 20;

/** Depth-first flatten so children render indented directly under their parent, root categories first. */
function toTree(categories: Category[]): { category: Category; depth: number }[] {
  const byParent = new Map<string | null, Category[]>();
  for (const category of categories) {
    const siblings = byParent.get(category.parentId) ?? [];
    siblings.push(category);
    byParent.set(category.parentId, siblings);
  }

  const rows: { category: Category; depth: number }[] = [];
  const visit = (parentId: string | null, depth: number): void => {
    for (const category of byParent.get(parentId) ?? []) {
      rows.push({ category, depth });
      visit(category.id, depth + 1);
    }
  };
  visit(null, 0);
  return rows;
}

export default function CategoriesPage(): React.JSX.Element {
  const t = useTranslations('category');
  const tCommon = useTranslations('common');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const { data, isLoading, isError } = useAdminCategories();
  const deleteCategory = useDeleteCategory();

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

  return (
    <div className="space-y-4">
      <PageHeader
        title={t('title')}
        action={
          <Button asChild>
            <Link href="/categories/new">
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
        headers={[t('columns.name'), t('columns.slug'), t('columns.actions')]}
        isLoading={isLoading}
        isError={isError}
        errorMessage={t('loadError')}
        isEmpty={pageRows.length === 0}
        emptyMessage={t('empty')}
        pagination={pagination}
      >
        {pageRows.map(({ category, depth }) => (
          <TableRow key={category.id}>
            <TableCell className="font-medium" style={{ paddingLeft: `${String(depth * 1.5 + 1)}rem` }}>
              {category.name}
            </TableCell>
            <TableCell className="text-muted-foreground">{category.slug}</TableCell>
            <TableCell className="flex justify-end gap-2 text-right">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/categories/${category.id}/edit`}>{tCommon('actions.edit')}</Link>
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
            </TableCell>
          </TableRow>
        ))}
      </DataTable>
    </div>
  );
}
