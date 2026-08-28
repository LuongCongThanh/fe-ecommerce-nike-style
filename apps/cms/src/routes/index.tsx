import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { ProductsSummary } from '@/features/dashboard/ProductsSummary';

export const Route = createFileRoute('/')({
  component: DashboardPage,
});

function DashboardPage(): React.JSX.Element {
  const { t } = useTranslation('common');

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
