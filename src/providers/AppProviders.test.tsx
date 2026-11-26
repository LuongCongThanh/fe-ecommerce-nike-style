import { render, screen, waitFor } from '@testing-library/react';
import { useQueryClient } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Providers } from '@/providers/AppProviders';
import { getAuthRuntimeAdapter } from '@/integrations/backend/client/runtime';
import { useAuth } from '@/modules/auth/session/useAuth';

// Auth stays real: the observable bootstrap result is the public session status, not a mocked private store.
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), replace: vi.fn() }) }));
vi.mock('next-intl', () => ({ useLocale: () => 'vi' }));
vi.mock('@tanstack/react-query-devtools', () => ({ ReactQueryDevtools: () => null }));
vi.mock('next-themes', () => ({ ThemeProvider: ({ children }: { children: ReactNode }) => children }));
vi.mock('next-nprogress-bar', () => ({ AppProgressBar: () => <div data-testid="progress" /> }));
vi.mock('sonner', () => ({ Toaster: () => <div data-testid="toaster" /> }));

function CacheProbe({ locale }: { readonly locale: string }) {
  const client = useQueryClient();
  const { authStatus } = useAuth();
  return (
    <>
      <button type="button" onClick={() => client.setQueryData(['provider-check'], 'cached')}>
        {locale}:{client.getQueryData<string>(['provider-check']) ?? 'empty'}
      </button>
      <output data-testid="auth-status">{authStatus}</output>
    </>
  );
}

describe('App provider lifetime', () => {
  it('retains cached data and one session bootstrap when localized children change', async () => {
    const { rerender, unmount } = render(
      <Providers>
        <CacheProbe locale="vi" />
      </Providers>,
    );
    screen.getByRole('button', { name: 'vi:empty' }).click();

    rerender(
      <Providers>
        <CacheProbe locale="en" />
      </Providers>,
    );

    expect(screen.getByRole('button', { name: 'en:cached' })).toBeInTheDocument();
    // Bootstrap without a refresh token in memory settles to anonymous (no F5 session restore).
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('anonymous');
    });
    expect(getAuthRuntimeAdapter()).not.toBeNull();
    expect(screen.getAllByTestId('toaster')).toHaveLength(1);
    expect(screen.getAllByTestId('progress')).toHaveLength(1);

    unmount();
    expect(getAuthRuntimeAdapter()).toBeNull();
  });
});
