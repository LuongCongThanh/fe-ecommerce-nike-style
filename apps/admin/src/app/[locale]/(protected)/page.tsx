'use client';

import { Boxes, Package, ShoppingBag, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { DashboardHero } from '@/features/dashboard/DashboardHero';
import { OrderStatusBreakdown } from '@/features/dashboard/OrderStatusBreakdown';
import { ProductsSummary } from '@/features/dashboard/ProductsSummary';
import { RecentOrders } from '@/features/dashboard/RecentOrders';
import { useAdminInventory } from '@/features/inventory/useAdminInventory';
import { useAdminOrders } from '@/features/orders/useAdminOrders';
import { useAdminProducts } from '@/features/products/useAdminProducts';
import { StatCard } from '@/features/shell/StatCard';
import { useAdminStaffList } from '@/features/staff/useAdminStaffList';

/** Below this available quantity a SKU counts toward the "Low stock" stat — an operational
 * threshold, not a claim about a real inventory policy the backend enforces. */
const LOW_STOCK_THRESHOLD = 5;

export default function DashboardPage() {
  const t = useTranslations('common.dashboard');
  const products = useAdminProducts({ page: 1, pageSize: 1 });
  const orders = useAdminOrders();
  const staff = useAdminStaffList();
  const inventory = useAdminInventory();

  const lowStockCount = inventory.data?.data.filter((item) => item.available < LOW_STOCK_THRESHOLD).length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-foreground text-xl font-semibold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground mt-1 text-sm">{t('subtitle')}</p>
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
        <StatCard label={t('statTotalProducts')} value={products.data?.meta.total} icon={Package} isLoading={products.isLoading} />
        <StatCard label={t('statTotalOrders')} value={orders.data?.length} icon={ShoppingBag} isLoading={orders.isLoading} />
        <StatCard label={t('statLowStock')} value={lowStockCount} icon={Boxes} isLoading={inventory.isLoading} />
        <StatCard label={t('statTotalStaff')} value={staff.data?.data.length} icon={Users} isLoading={staff.isLoading} />
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
