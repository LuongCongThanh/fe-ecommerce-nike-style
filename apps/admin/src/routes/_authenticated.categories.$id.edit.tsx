import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { CategoryForm } from '@/features/categories/CategoryForm';
import { useAdminCategories } from '@/features/categories/useAdminCategories';
import { useUpdateCategory } from '@/features/categories/useCategoryMutations';
import { PageHeader } from '@/shell/PageHeader';

export const Route = createFileRoute('/_authenticated/categories/$id/edit')({
  component: EditCategoryPage,
});

function EditCategoryPage(): React.JSX.Element {
  const { t } = useTranslation('category');
  const { t: tCommon } = useTranslation('common');
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useAdminCategories();
  const updateCategory = useUpdateCategory(id);

  const category = data?.data.find((c) => c.id === id);

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title={t('edit')} />

      {isLoading ? <p className="text-muted-foreground text-sm">{tCommon('loading')}</p> : null}
      {isError ? (
        <p role="alert" className="text-destructive text-sm">
          {t('loadOneError')}
        </p>
      ) : null}

      {category !== undefined ? (
        <CategoryForm
          initial={category}
          categories={data?.data ?? []}
          submitLabel={t('saveChanges')}
          isSubmitting={updateCategory.isPending}
          errorMessage={updateCategory.error instanceof Error ? updateCategory.error.message : null}
          onSubmit={(input) => {
            updateCategory.mutate(input, {
              onSuccess: () => {
                void navigate({ to: '/categories' });
              },
            });
          }}
        />
      ) : null}
    </div>
  );
}
