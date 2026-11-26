'use client';

import { useEffect } from 'react';

import { useTranslations } from 'next-intl';

import { ErrorState } from '@/shared/components/ErrorState';
import { captureError } from '@/shared/monitoring/sentry';

interface RouteErrorStateProps {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}

export function RouteErrorState({ error, reset }: RouteErrorStateProps): React.JSX.Element {
  const t = useTranslations('common');

  useEffect(() => {
    // Log the error to Sentry
    captureError(error, { digest: error.digest });
  }, [error]);

  return (
    <div className="container mx-auto flex min-h-[70vh] flex-col items-center justify-center px-4">
      <ErrorState
        title={t('errorTitle')}
        description={t('errorDescription')}
        retryLabel={t('retry')}
        onRetry={() => {
          reset();
        }}
      />
    </div>
  );
}
