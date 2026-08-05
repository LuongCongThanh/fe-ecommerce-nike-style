import { ProductsSummary } from '@/features/dashboard/ProductsSummary';

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-foreground text-xl font-semibold tracking-tight">Tổng quan</h1>
        <p className="text-muted-foreground mt-1 text-sm">Trạng thái nội dung và danh mục sản phẩm liên quan.</p>
      </div>
      <ProductsSummary />
    </div>
  );
}
