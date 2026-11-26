import type { DefaultOptions } from '@tanstack/react-query';

import { ApiError } from '@/integrations/backend/client/api-error';

/**
 * Default options shared by the browser QueryClient (`providers/query-client.ts`) and the per-request
 * server QueryClient (`modules/catalog/server/prefetchCatalog.ts`), so both stay aligned. Pure data:
 * no auth, session or toast side effects, so it is safe in the server graph.
 *
 * No `mutations.onError` default: the one place a mutation toasts is `useApiMutation`.
 */
export const QUERY_CLIENT_DEFAULTS: DefaultOptions = {
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
};
