'use client';

import { useState } from 'react';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { MotionConfig } from 'framer-motion';
import { AppProgressBar } from 'next-nprogress-bar';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';

import { AuthRuntimeProvider } from '@/core/session/AuthRuntimeProvider';
import { makeQueryClient } from '@/shared/lib/query-client';

const progressBarOptions = { showSpinner: false };

interface ProvidersProps {
  readonly children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  // eslint-disable-next-line react/hook-use-state
  const [queryClient] = useState(() => makeQueryClient());

  return (
    <AuthRuntimeProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <MotionConfig reducedMotion="user">
            {children}
            <Toaster richColors position="top-right" toastOptions={{ className: '!rounded-xl !border !bg-card !shadow-md' }} />
            <AppProgressBar color="#e85d04" height="2px" options={progressBarOptions} />
            {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
          </MotionConfig>
        </ThemeProvider>
      </QueryClientProvider>
    </AuthRuntimeProvider>
  );
}
