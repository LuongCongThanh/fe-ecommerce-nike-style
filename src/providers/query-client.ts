import { QueryClient } from '@tanstack/react-query';

import { QUERY_CLIENT_DEFAULTS } from '@/shared/queries/queryClientDefaults';

/** Browser QueryClient. Defaults live in `shared/queries/queryClientDefaults.ts`, shared with the server prefetch. */
export function makeQueryClient() {
  return new QueryClient({ defaultOptions: QUERY_CLIENT_DEFAULTS });
}
