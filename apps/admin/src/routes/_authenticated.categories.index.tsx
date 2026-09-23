import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { createFileRoute, Link } from '@tanstack/react-router';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useCategoryList } from '@/features/categories/useCategoryList';
import { DataTable } from '@/shell/DataTable';
import { PageHeader } from '@/shell/PageHeader';

export const Route = createFileRoute('/_authenticated/categories/')({
  component: CategoriesPage,
});

function CategoriesPage(): React.JSX.Element {
  const { t } = useTranslation('category');
  const list = useCategoryList();

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

      <Input
        placeholder={t('searchPlaceholder')}
        value={list.search}
        onChange={(e) => {
          list.setSearch(e.target.value);
        }}
        className="max-w-sm"
      />

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
        isEmpty={list.pageRows.length === 0}
        emptyMessage={t('empty')}
        pagination={list.pagination}
      />
    </div>
  );
}
