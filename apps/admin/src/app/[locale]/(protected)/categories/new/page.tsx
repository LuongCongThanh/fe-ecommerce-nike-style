'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';

import { CategoryForm } from '@/features/categories/CategoryForm';
import { useAdminCategories } from '@/features/categories/useAdminCategories';
import { useCreateCategory } from '@/features/categories/useCategoryMutations';
import { PageHeader } from '@/features/shell/PageHeader';

export default function NewCategoryPage(): React.JSX.Element {
  const t = useTranslations('category');
  const router = useRouter();
  const { data } = useAdminCategories();
  const createCategory = useCreateCategory();

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title={t('add')} />
      <CategoryForm
        categories={data?.data ?? []}
        submitLabel={t('create')}
        isSubmitting={createCategory.isPending}
        errorMessage={createCategory.error instanceof Error ? createCategory.error.message : null}
        onSubmit={(input) => {
          createCategory.mutate(input, {
            onSuccess: () => {
              router.push('/categories');
            },
          });
        }}
      />
    </div>
  );
}
