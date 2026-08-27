'use client';

import { getCategories, getProducts } from '@repo/api-sdk/endpoints/catalog';
import { Layers, Package } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';

import { ProductsSummary } from '@/features/dashboard/ProductsSummary';
import { StatCard } from '@/features/shell/StatCard';

export default function DashboardPage() {
  const t = useTranslations('common');
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
