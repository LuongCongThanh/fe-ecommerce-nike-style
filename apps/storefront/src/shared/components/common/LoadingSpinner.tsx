import { Loader2 } from 'lucide-react';

import { cn } from '@/shared/lib/utils';

/**
 * Spinner nhỏ — dùng cho action cục bộ (button submit, section nhỏ).
 * Dùng `PageLoader` nếu cần loading cả trang.
 */
interface LoadingSpinnerProps {
  readonly className?: string;
  readonly label?: string;
  readonly size?: 'sm' | 'md' | 'lg';
}

const spinnerSizeMap = {
  sm: 'size-4',
  md: 'size-5',
  lg: 'size-6',
} as const;

export function LoadingSpinner({ className, label = 'Loading', size = 'md' }: LoadingSpinnerProps) {
  return (
    <span className={cn('inline-flex items-center justify-center', className)} role="status" aria-label={label}>
      <Loader2 className={cn('animate-spin', spinnerSizeMap[size])} />
    </span>
  );
}
