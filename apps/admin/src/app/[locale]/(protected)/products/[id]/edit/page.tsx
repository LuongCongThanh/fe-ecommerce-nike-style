'use client';

import { use } from 'react';

import { getAdminProduct } from '@repo/api-sdk/endpoints/admin-catalog';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';

import { ProductForm } from '@/features/products/ProductForm';
import { useUpdateProduct } from '@/features/products/useProductMutations';
import { PageHeader } from '@/features/shell/PageHeader';

export default function EditProductPage({ params }: { readonly params: Promise<{ id: string }> }): React.JSX.Element {
  const t = useTranslations('product');
  const tCommon = useTranslations('common');
  const { id } = use(params);
  const router = useRouter();
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
                router.push('/products');
              },
            });
          }}
        />
      ) : null}
    </div>
  );
}
