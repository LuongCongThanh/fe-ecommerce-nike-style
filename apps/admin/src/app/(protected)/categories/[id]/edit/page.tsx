'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';

import { CategoryForm } from '@/features/categories/CategoryForm';
import { useAdminCategories } from '@/features/categories/useAdminCategories';
import { useUpdateCategory } from '@/features/categories/useCategoryMutations';

export default function EditCategoryPage({ params }: { readonly params: Promise<{ id: string }> }): React.JSX.Element {
  const { id } = use(params);
  const router = useRouter();
  const { data, isLoading, isError } = useAdminCategories();
  const updateCategory = useUpdateCategory(id);

  const category = data?.data.find((c) => c.id === id);

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-bold">Sửa danh mục</h1>

      {isLoading ? <p className="text-muted-foreground text-sm">Đang tải...</p> : null}
      {isError ? (
        <p role="alert" className="text-destructive text-sm">
          Không thể tải danh mục.
        </p>
      ) : null}

      {category !== undefined ? (
        <CategoryForm
          initial={category}
          categories={data?.data ?? []}
          submitLabel="Lưu thay đổi"
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
