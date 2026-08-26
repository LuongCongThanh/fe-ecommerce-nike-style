import { useTranslations } from 'next-intl';

import { ProductsSummary } from '@/features/dashboard/ProductsSummary';

export default function DashboardPage() {
  const t = useTranslations('common.dashboard');

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-foreground text-xl font-semibold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground mt-1 text-sm">{t('subtitle')}</p>
      </div>
      <ProductsSummary />
    </div>
  );
}
