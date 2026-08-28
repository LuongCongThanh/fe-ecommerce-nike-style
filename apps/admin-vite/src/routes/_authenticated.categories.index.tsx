import { useState } from 'react';

import type { Category } from '@repo/schemas/catalog';
import { Button } from '@repo/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@repo/ui/table';
import { createFileRoute, Link } from '@tanstack/react-router';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useAdminCategories } from '@/features/categories/useAdminCategories';
import { useDeleteCategory } from '@/features/categories/useCategoryMutations';
import { ConfirmDialog } from '@/features/shell/ConfirmDialog';

export const Route = createFileRoute('/_authenticated/categories/')({
  component: CategoriesPage,
});

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

function CategoriesPage(): React.JSX.Element {
  const { t } = useTranslation('category');
  const { t: tCommon } = useTranslation('common');
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

  const rows = data !== undefined ? toTree(data.data) : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{t('title')}</h1>
        <Button asChild>
          <Link to="/categories/new">
            <Plus className="size-4" data-icon="inline-start" />
            {t('add')}
          </Link>
        </Button>
      </div>

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
                <TableHead>{t('columns.slug')}</TableHead>
                <TableHead className="text-right">{t('columns.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(({ category, depth }) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium" style={{ paddingLeft: `${String(depth * 1.5 + 1)}rem` }}>
                    {category.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                  <TableCell className="flex justify-end gap-2 text-right">
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {rows.length === 0 ? <p className="text-muted-foreground p-6 text-center text-sm">{t('empty')}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
