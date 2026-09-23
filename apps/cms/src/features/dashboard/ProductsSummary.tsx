import { useCatalogProducts } from '@repo/shared/hooks/useCatalogProducts';
import { SummaryListCard } from '@repo/ui/summary-list-card';
import { useTranslation } from 'react-i18next';

export function ProductsSummary(): React.JSX.Element {
  const { t } = useTranslation('common');
  const { data, isLoading, isError, refetch } = useCatalogProducts();
  const products = data?.data ?? [];

  return (
    <SummaryListCard
      title={t('dashboard.productsCardTitle')}
      reloadLabel={t('actions.reload')}
      onReload={() => {
        void refetch();
      }}
      isLoading={isLoading}
      isError={isError}
      errorMessage={t('dashboard.loadError')}
      emptyMessage={t('dashboard.empty')}
      items={products.map((product) => ({ id: product.id, label: product.name }))}
    />
  );
}
