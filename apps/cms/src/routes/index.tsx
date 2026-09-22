import { getCategories, getProducts } from '@repo/api-sdk/endpoints/catalog';
import { StatCard } from '@repo/ui/stat-card';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { Layers, Package } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { ProductsSummary } from '@/features/dashboard/ProductsSummary';

export const Route = createFileRoute('/')({
  component: DashboardPage,
});

function DashboardPage(): React.JSX.Element {
  const { t } = useTranslation('common');
  const products = useQuery({ queryKey: ['dashboard', 'products-count'], queryFn: () => getProducts() });
  const categories = useQuery({ queryKey: ['dashboard', 'categories-count'], queryFn: getCategories });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-foreground text-xl font-semibold tracking-tight">{t('dashboardTitle')}</h1>
        <p className="text-muted-foreground mt-1 text-sm">{t('dashboardSubtitle')}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <StatCard label={t('statTotalProducts')} value={products.data?.meta.total} icon={Package} isLoading={products.isLoading} />
        <StatCard label={t('statTotalCategories')} value={categories.data?.data.length} icon={Layers} isLoading={categories.isLoading} />
      </div>

      <ProductsSummary />
    </div>
  );
}
