import type { LucideIcon } from 'lucide-react';
import { AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/shared/components/base/button';
import { cn } from '@/shared/lib/utils';

interface ErrorStateProps {
  readonly title?: string;
  readonly description?: string;
  readonly icon?: LucideIcon;
  readonly onRetry?: () => void;
  readonly className?: string;
}

export function ErrorState({ title, description, icon: Icon = AlertCircle, onRetry, className }: ErrorStateProps): React.JSX.Element {
  const t = useTranslations('common');

  return (
    <div className={cn('flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-12 text-center', className)}>
      <div className="bg-error-50 dark:bg-error-700/20 mb-4 rounded-full p-4">
        <Icon className="text-error-500 size-8" />
      </div>
      <h3 className="text-foreground text-lg font-semibold">{title ?? t('errorTitle')}</h3>
      <p className="text-muted-foreground mt-2 max-w-md text-sm">{description ?? t('errorDescription')}</p>
      {onRetry != null ? (
        <Button className="mt-6 min-w-30" onClick={onRetry}>
          {t('retry')}
        </Button>
      ) : null}
    </div>
  );
}
