// Hallmark redesign · design-system: design.md · scope: app page (functional, no enrichment)
import { AddressesClient } from '@/app/[locale]/(shop)/_lib/components/addresses/AddressesClient';
import { PageShell } from '@/app/[locale]/(shop)/_lib/components/layout/PageShell';

export default function AddressesPage(): React.JSX.Element {
  return (
    <PageShell.List>
      <div className="mb-6 border-b pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-balance">Sổ địa chỉ</h1>
        <p className="text-muted-foreground mt-1 text-sm">Quản lý địa chỉ giao hàng của bạn.</p>
      </div>
      <AddressesClient />
    </PageShell.List>
  );
}
