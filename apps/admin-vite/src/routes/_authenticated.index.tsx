import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

export const Route = createFileRoute('/_authenticated/')({
  component: DashboardPage,
});

function DashboardPage(): React.JSX.Element {
  const { t } = useTranslation('common');
  return (
    <div>
      <h1 className="text-xl font-bold">{t('nav.dashboard', { defaultValue: 'Dashboard' })}</h1>
      <p className="text-muted-foreground mt-2 text-sm">
        Stage 1 skeleton — routing, mock auth, and i18n are wired up. Feature pages (orders, inventory, products, categories, staff) are ported in
        Stage 2.
      </p>
    </div>
  );
}
