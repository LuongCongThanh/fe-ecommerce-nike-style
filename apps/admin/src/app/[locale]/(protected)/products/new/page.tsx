'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';

import { ProductForm } from '@/features/products/ProductForm';
import { useCreateProduct } from '@/features/products/useProductMutations';
import { PageHeader } from '@/features/shell/PageHeader';

export default function NewProductPage(): React.JSX.Element {
  const t = useTranslations('product');
  const router = useRouter();
  const createProduct = useCreateProduct();

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title={t('add')} />
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
