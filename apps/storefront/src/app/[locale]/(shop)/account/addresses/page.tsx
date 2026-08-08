import { AddressesClient } from '@/app/[locale]/(shop)/_lib/components/addresses/AddressesClient';
import { PageShell } from '@/app/[locale]/(shop)/_lib/components/layout/PageShell';

export default function AddressesPage(): React.JSX.Element {
  return (
    <PageShell.List>
      <h1 className="mb-6 text-2xl font-bold">Sổ địa chỉ</h1>
      <AddressesClient />
    </PageShell.List>
  );
}
