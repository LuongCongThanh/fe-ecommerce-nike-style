import type { ReactNode } from 'react';

import { ErrorState } from './ErrorState';
import { LoadingSpinner } from './LoadingSpinner';

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.length > 0) {
    return error.message;
  }
  return fallback;
}

interface QueryStateProps {
  /** True while the query/mutation is in its initial fetch (no data yet). */
  readonly isLoading: boolean;
  /** Error object from the query, or `null`/`undefined` when there is none. */
  readonly error?: unknown;
  /** Called when the user clicks "Retry". Omit to hide the retry button. */
  readonly onRetry?: () => void;
  /** Custom loading UI (e.g. a skeleton matching the page layout). Defaults to a centered spinner. */
  readonly loadingFallback?: ReactNode;
  /** Accessible label for the default spinner. Storefront/Admin/CMS each own their own i18n library, so
   * this package cannot translate on their behalf — every caller must pass its own translated string. */
  readonly loadingLabel: string;
  readonly errorTitle: string;
  readonly errorDescription?: string;
  /** Used when `errorDescription` is omitted and `error` has no usable message. */
  readonly errorFallbackDescription: string;
  readonly retryLabel: string;
  readonly children: ReactNode;
}

/**
 * Single place that decides what a page renders for the three states every data-driven
 * page goes through: loading → error → data. Keeps loading/error UI (and its a11y wiring)
 * consistent across the app instead of every client component re-inventing it.
 *
 * ```tsx
 * <QueryState isLoading={isLoading} error={error} onRetry={refetch} loadingLabel={t('loading')} errorTitle={t('error.title')} retryLabel={t('actions.retry')} errorFallbackDescription={t('error.fallback')}>
 *   <ProductGrid products={data} />
 * </QueryState>
 * ```
 */
export function QueryState({
  isLoading,
  error,
  onRetry,
  loadingFallback,
  loadingLabel,
  errorTitle,
  errorDescription,
  errorFallbackDescription,
  retryLabel,
  children,
}: QueryStateProps): React.JSX.Element {
  if (isLoading) {
    return (
      <>
        {loadingFallback ?? (
          <div className="flex min-h-60 items-center justify-center py-12">
            <LoadingSpinner size="lg" label={loadingLabel} />
          </div>
        )}
      </>
    );
  }

  if (error != null) {
    return (
      <ErrorState
        title={errorTitle}
        description={errorDescription ?? getErrorMessage(error, errorFallbackDescription)}
        retryLabel={retryLabel}
        onRetry={onRetry}
      />
    );
  }

  return <>{children}</>;
}
