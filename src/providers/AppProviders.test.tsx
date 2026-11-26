import { render, screen } from '@testing-library/react';
import { useQueryClient } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Providers } from '@/providers/AppProviders';
import { getAuthRuntimeAdapter } from '@/lib/api/client/runtime';

const { bootstrapAuth } = vi.hoisted(() => ({ bootstrapAuth: vi.fn().mockResolvedValue(undefined) }));
vi.mock('@/features/auth/stores/auth.store', () => ({ bootstrapAuth, clearAuth: vi.fn(), getAccessToken: () => null, refreshAccessToken: vi.fn() }));
vi.mock('@tanstack/react-query-devtools', () => ({ ReactQueryDevtools: () => null }));
vi.mock('next-themes', () => ({ ThemeProvider: ({ children }: { children: ReactNode }) => children }));
vi.mock('next-nprogress-bar', () => ({ AppProgressBar: () => <div data-testid="progress" /> }));
vi.mock('sonner', () => ({ Toaster: () => <div data-testid="toaster" /> }));

function CacheProbe({ locale }: { readonly locale: string }) {
  const client = useQueryClient();
  return (
    <button type="button" onClick={() => client.setQueryData(['provider-check'], 'cached')}>
      {locale}:{client.getQueryData<string>(['provider-check']) ?? 'empty'}
    </button>
  );
}

describe('App provider lifetime', () => {
  it('retains cached data and one session bootstrap when localized children change', () => {
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
    expect(bootstrapAuth).toHaveBeenCalledTimes(1);
    expect(getAuthRuntimeAdapter()).not.toBeNull();
    expect(screen.getAllByTestId('toaster')).toHaveLength(1);
    expect(screen.getAllByTestId('progress')).toHaveLength(1);

    unmount();
    expect(getAuthRuntimeAdapter()).toBeNull();
  });
});
