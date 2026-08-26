import { useTranslations } from 'next-intl';

import { ProductsSummary } from '@/features/dashboard/ProductsSummary';

export default function DashboardPage() {
  const t = useTranslations('common');

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-foreground text-xl font-semibold tracking-tight">{t('dashboardTitle')}</h1>
        <p className="text-muted-foreground mt-1 text-sm">{t('dashboardSubtitle')}</p>
      </div>
      <ProductsSummary />
    </div>
  );
}
