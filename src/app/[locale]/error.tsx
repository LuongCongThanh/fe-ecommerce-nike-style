'use client';

import { RouteErrorState } from '@/layouts/components/RouteErrorState';

interface GlobalErrorProps {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps): React.JSX.Element {
  return <RouteErrorState error={error} reset={reset} />;
}
