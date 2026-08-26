'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';

import { ProductForm } from '@/features/products/ProductForm';
import { useCreateProduct } from '@/features/products/useProductMutations';

export default function NewProductPage(): React.JSX.Element {
  const t = useTranslations('product');
  const router = useRouter();
  const createProduct = useCreateProduct();

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-bold">{t('add')}</h1>
      <ProductForm
        submitLabel={t('create')}
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
