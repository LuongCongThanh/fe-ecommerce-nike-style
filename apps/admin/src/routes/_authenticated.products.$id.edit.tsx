import { getAdminProduct } from '@repo/api-sdk/endpoints/admin-catalog';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { ProductForm } from '@/features/products/ProductForm';
import { useUpdateProduct } from '@/features/products/useProductMutations';
import { PageHeader } from '@/features/shell/PageHeader';

export const Route = createFileRoute('/_authenticated/products/$id/edit')({
  component: EditProductPage,
});

function EditProductPage(): React.JSX.Element {
  const { t } = useTranslation('product');
  const { t: tCommon } = useTranslation('common');
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data: product, isLoading, isError } = useQuery({ queryKey: ['admin', 'products', id], queryFn: () => getAdminProduct(id) });
  const updateProduct = useUpdateProduct(id);

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title={t('edit')} />

      {isLoading ? <p className="text-muted-foreground text-sm">{tCommon('loading')}</p> : null}
      {isError ? (
        <p role="alert" className="text-destructive text-sm">
          {t('loadOneError')}
        </p>
      ) : null}

      {product !== undefined ? (
        <ProductForm
          initial={product}
          submitLabel={t('saveChanges')}
          isSubmitting={updateProduct.isPending}
          errorMessage={updateProduct.error instanceof Error ? updateProduct.error.message : null}
          onSubmit={(input) => {
            updateProduct.mutate(input, {
              onSuccess: () => {
                void navigate({ to: '/products' });
              },
            });
          }}
        />
      ) : null}
    </div>
  );
}
