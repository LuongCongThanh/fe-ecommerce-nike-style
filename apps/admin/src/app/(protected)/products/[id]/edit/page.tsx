'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';

import { getAdminProduct } from '@repo/api-sdk/endpoints/admin-catalog';
import { useQuery } from '@tanstack/react-query';

import { ProductForm } from '@/features/products/ProductForm';
import { useUpdateProduct } from '@/features/products/useProductMutations';

export default function EditProductPage({ params }: { readonly params: Promise<{ id: string }> }): React.JSX.Element {
  const { id } = use(params);
  const router = useRouter();
  const { data: product, isLoading, isError } = useQuery({ queryKey: ['admin', 'products', id], queryFn: () => getAdminProduct(id) });
  const updateProduct = useUpdateProduct(id);

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-bold">Sửa sản phẩm</h1>

      {isLoading ? <p className="text-muted-foreground text-sm">Đang tải...</p> : null}
      {isError ? (
        <p role="alert" className="text-destructive text-sm">
          Không thể tải sản phẩm.
        </p>
      ) : null}

      {product !== undefined ? (
        <ProductForm
          initial={product}
          submitLabel="Lưu thay đổi"
          isSubmitting={updateProduct.isPending}
          errorMessage={updateProduct.error instanceof Error ? updateProduct.error.message : null}
          onSubmit={(input) => {
            updateProduct.mutate(input, {
              onSuccess: () => {
                router.push('/products');
              },
            });
          }}
        />
      ) : null}
    </div>
  );
}
