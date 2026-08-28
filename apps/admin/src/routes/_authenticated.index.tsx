import { createFileRoute } from '@tanstack/react-router';
import { Boxes, Package, ShoppingBag, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { DashboardHero } from '@/features/dashboard/DashboardHero';
import { OrderStatusBreakdown } from '@/features/dashboard/OrderStatusBreakdown';
import { ProductsSummary } from '@/features/dashboard/ProductsSummary';
import { RecentOrders } from '@/features/dashboard/RecentOrders';
import { useAdminInventory } from '@/features/inventory/useAdminInventory';
import { useAdminOrders } from '@/features/orders/useAdminOrders';
import { useAdminProducts } from '@/features/products/useAdminProducts';
import { StatCard } from '@/features/shell/StatCard';
import { useAdminStaffList } from '@/features/staff/useAdminStaffList';

export const Route = createFileRoute('/_authenticated/')({
  component: DashboardPage,
});

/** Below this available quantity a SKU counts toward the "Low stock" stat — an operational
 * threshold, not a claim about a real inventory policy the backend enforces. */
const LOW_STOCK_THRESHOLD = 5;

function DashboardPage(): React.JSX.Element {
  const { t } = useTranslation('common');
  const products = useAdminProducts({ page: 1, pageSize: 1 });
  const orders = useAdminOrders();
  const staff = useAdminStaffList();
  const inventory = useAdminInventory();

  const lowStockCount = inventory.data?.data.filter((item) => item.available < LOW_STOCK_THRESHOLD).length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-foreground text-xl font-semibold tracking-tight">{t('dashboard.title')}</h1>
        <p className="text-muted-foreground mt-1 text-sm">{t('dashboard.subtitle')}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <DashboardHero />
        </div>
        <div className="lg:col-span-2">
          <OrderStatusBreakdown />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label={t('dashboard.statTotalProducts')} value={products.data?.meta.total} icon={Package} isLoading={products.isLoading} />
        <StatCard label={t('dashboard.statTotalOrders')} value={orders.data?.length} icon={ShoppingBag} isLoading={orders.isLoading} />
        <StatCard label={t('dashboard.statLowStock')} value={lowStockCount} icon={Boxes} isLoading={inventory.isLoading} />
        <StatCard label={t('dashboard.statTotalStaff')} value={staff.data?.data.length} icon={Users} isLoading={staff.isLoading} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentOrders />
        </div>
        <div className="lg:col-span-1">
          <ProductsSummary />
        </div>
      </div>
    </div>
  );
}
