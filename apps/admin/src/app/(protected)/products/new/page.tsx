'use client';

import { useRouter } from 'next/navigation';

import { ProductForm } from '@/features/products/ProductForm';
import { useCreateProduct } from '@/features/products/useProductMutations';

export default function NewProductPage(): React.JSX.Element {
  const router = useRouter();
  const createProduct = useCreateProduct();

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-bold">Thêm sản phẩm</h1>
      <ProductForm
        submitLabel="Tạo sản phẩm"
        isSubmitting={createProduct.isPending}
        errorMessage={createProduct.error instanceof Error ? createProduct.error.message : null}
        onSubmit={(input) => {
          createProduct.mutate(input, {
            onSuccess: () => {
              router.push('/products');
            },
          });
        }}
      />
    </div>
  );
}
