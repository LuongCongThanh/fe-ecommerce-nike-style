import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { CategoryForm } from '@/features/categories/CategoryForm';
import { useAdminCategories } from '@/features/categories/useAdminCategories';
import { useCreateCategory } from '@/features/categories/useCategoryMutations';

export const Route = createFileRoute('/_authenticated/categories/new')({
  component: NewCategoryPage,
});

function NewCategoryPage(): React.JSX.Element {
  const { t } = useTranslation('category');
  const navigate = useNavigate();
  const { data } = useAdminCategories();
  const createCategory = useCreateCategory();

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-bold">{t('add')}</h1>
      <CategoryForm
        categories={data?.data ?? []}
        submitLabel={t('create')}
        isSubmitting={createCategory.isPending}
        errorMessage={createCategory.error instanceof Error ? createCategory.error.message : null}
        onSubmit={(input) => {
          createCategory.mutate(input, {
            onSuccess: () => {
              void navigate({ to: '/categories' });
            },
          });
        }}
      />
    </div>
  );
}
