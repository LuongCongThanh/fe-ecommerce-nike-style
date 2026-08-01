'use client';

import { useEffect } from 'react';

import { ErrorState } from '@/shared/components/common/ErrorState';
import { captureError } from '@/shared/lib/monitoring/sentry';

interface GlobalErrorProps {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps): React.JSX.Element {
  useEffect(() => {
    // Log the error to Sentry
    captureError(error, { digest: error.digest });
  }, [error]);

  return (
    <div className="container mx-auto flex min-h-[70vh] flex-col items-center justify-center px-4">
      <ErrorState
        onRetry={() => {
          reset();
        }}
      />
    </div>
  );
}
