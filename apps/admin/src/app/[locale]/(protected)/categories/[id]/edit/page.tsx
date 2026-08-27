'use client';

import { use } from 'react';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';

import { CategoryForm } from '@/features/categories/CategoryForm';
import { useAdminCategories } from '@/features/categories/useAdminCategories';
import { useUpdateCategory } from '@/features/categories/useCategoryMutations';
import { PageHeader } from '@/features/shell/PageHeader';

export default function EditCategoryPage({ params }: { readonly params: Promise<{ id: string }> }): React.JSX.Element {
  const t = useTranslations('category');
  const tCommon = useTranslations('common');
  const { id } = use(params);
  const router = useRouter();
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
                router.push('/categories');
              },
            });
          }}
        />
      ) : null}
    </div>
  );
}
