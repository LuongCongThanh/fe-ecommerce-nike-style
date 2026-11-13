import { QueryClient } from '@tanstack/react-query';

import { ApiError } from '@/shared/lib/errors/api-error';

/**
 * No `mutations.onError` default here — that used to toast a generic message on every failed
 * mutation, *in addition to* the specific message each mutation hook's own `onError` already showed
 * (react-query v5 runs both), producing a double toast on every failure. The one place a mutation
 * toasts is now `useApiMutation` (`shared/lib/hooks/useApiMutation.ts`), which every mutation hook
 * goes through.
 */
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          if (error instanceof ApiError) {
            if (error.status >= 400 && error.status < 500) return false;
          }
          return failureCount < 2;
        },
      },
      mutations: {
        retry: false,
      },
    },
  });
}
