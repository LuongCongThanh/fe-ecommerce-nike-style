import { LoadingSpinner } from '@/shared/components/common/LoadingSpinner';

/**
 * Loading toàn trang — dùng khi chờ data cho cả một trang/route.
 *
 * Khi nào dùng:
 *   - `loading.tsx` của Next.js (route transition tự động)
 *   - Page component đang fetch data: `if (isLoading) return <PageLoader />;`
 *
 * Khi nào KHÔNG dùng:
 *   - Loading bên trong list/grid → dùng Skeleton để tránh layout shift
 *   - Loading nút submit / action nhỏ → dùng `<LoadingSpinner size="sm" />`
 */
export function PageLoader(): React.JSX.Element {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );
}
