import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

/** Baseline per FE-EXECUTION.md §2.9. */
export function AppQueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
