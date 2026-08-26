'use client';

import { useRouter } from 'next/navigation';

import { CategoryForm } from '@/features/categories/CategoryForm';
import { useAdminCategories } from '@/features/categories/useAdminCategories';
import { useCreateCategory } from '@/features/categories/useCategoryMutations';

export default function NewCategoryPage(): React.JSX.Element {
  const router = useRouter();
  const { data } = useAdminCategories();
  const createCategory = useCreateCategory();

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-bold">Thêm danh mục</h1>
      <CategoryForm
        categories={data?.data ?? []}
        submitLabel="Tạo danh mục"
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
