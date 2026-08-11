import type { LucideIcon } from 'lucide-react';
import { AlertCircle } from 'lucide-react';

import { Button } from '@repo/ui/button';

import { cn } from '../lib/utils';

interface ErrorStateProps {
  readonly title?: string;
  readonly description?: string;
  readonly retryLabel?: string;
  readonly icon?: LucideIcon;
  readonly onRetry?: () => void;
  readonly className?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'Please try again in a moment.',
  retryLabel = 'Retry',
  icon: Icon = AlertCircle,
  onRetry,
  className,
}: ErrorStateProps): React.JSX.Element {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn('flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-12 text-center', className)}
    >
      <div className="bg-error-50 dark:bg-error-700/20 mb-4 rounded-full p-4">
        <Icon className="text-error-500 size-8" />
      </div>
      <h3 className="text-foreground text-lg font-semibold">{title}</h3>
      <p className="text-muted-foreground mt-2 max-w-md text-sm">{description}</p>
      {onRetry != null ? (
        <Button className="mt-6 min-w-30" onClick={onRetry}>
          {retryLabel}
        </Button>
      ) : null}
    </div>
  );
}
