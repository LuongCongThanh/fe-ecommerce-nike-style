import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export interface AppQueryProviderProps {
  readonly children: React.ReactNode;
}

/**
 * The baseline React Query setup (FE-EXECUTION.md §2.9) for the Vite apps. `admin` and `cms` each
 * had their own copy of this file, differing only by a return-type annotation.
 *
 * The storefront deliberately does not use it: its provider also owns theming, motion config,
 * toasts and the progress bar, so it is a different module rather than this one plus extras.
 */
export function AppQueryProvider({ children }: AppQueryProviderProps): React.JSX.Element {
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
