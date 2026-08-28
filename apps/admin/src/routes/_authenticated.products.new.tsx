import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { ProductForm } from '@/features/products/ProductForm';
import { useCreateProduct } from '@/features/products/useProductMutations';

export const Route = createFileRoute('/_authenticated/products/new')({
  component: NewProductPage,
});

function NewProductPage(): React.JSX.Element {
  const { t } = useTranslation('product');
  const navigate = useNavigate();
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
              void navigate({ to: '/products' });
            },
          });
        }}
      />
    </div>
  );
}
