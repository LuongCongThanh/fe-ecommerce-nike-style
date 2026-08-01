import { PageLoader } from '@/shared/components/common/PageLoader';

// Next.js tự động hiển thị file này trong khi route đang load (Suspense boundary).
// Bao phủ toàn bộ [locale]/ — bao gồm (shop), (auth), (admin).
// Không đặt logic ở đây; UI loading thực sự nằm trong shared/components/common/PageLoader.
export default function GlobalLoading(): React.JSX.Element {
  return <PageLoader />;
}
