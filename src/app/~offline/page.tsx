import { OfflineState } from '@/layouts/components/OfflineState';

export const dynamic = 'force-static';

export const metadata = {
  title: 'Offline',
};

export default function OfflinePage() {
  return <OfflineState />;
}
