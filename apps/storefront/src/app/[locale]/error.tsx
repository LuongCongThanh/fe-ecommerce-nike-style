'use client';

import { useEffect } from 'react';

import { ErrorState } from '@repo/shared/error-state';
import { useTranslations } from 'next-intl';

import { captureError } from '@/shared/lib/monitoring/sentry';

interface GlobalErrorProps {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps): React.JSX.Element {
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
