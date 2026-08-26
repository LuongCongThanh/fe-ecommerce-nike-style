import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { toastMock } = vi.hoisted(() => ({
  toastMock: Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    dismiss: vi.fn(),
  }),
}));

vi.mock('sonner', () => ({
  toast: toastMock,
}));

import { useApiMutation } from '@/shared/lib/hooks/useApiMutation';
import { ApiError } from '@/shared/lib/errors/api-error';

function renderWithClient<T>(hook: () => T) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return renderHook(hook, { wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider> });
}

describe('useApiMutation (issue: double toast on mutation failure)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('toasts the ApiError message on failure — exactly once', async () => {
    const { result } = renderWithClient(() =>
      useApiMutation({
        mutationFn: () => Promise.reject(new ApiError({ message: 'Địa chỉ không hợp lệ', status: 422 })),
        errorFallback: 'Lưu thất bại. Vui lòng thử lại.',
      }),
    );

    act(() => result.current.mutate(undefined));
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(toastMock.error).toHaveBeenCalledTimes(1);
    expect(toastMock.error).toHaveBeenCalledWith('Địa chỉ không hợp lệ', undefined);
  });

  it('falls back to errorFallback for a non-ApiError failure — exactly once', async () => {
    const { result } = renderWithClient(() =>
      useApiMutation({
        mutationFn: () => Promise.reject(new Error('network down')),
        errorFallback: 'Lưu thất bại. Vui lòng thử lại.',
      }),
    );

    act(() => result.current.mutate(undefined));
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(toastMock.error).toHaveBeenCalledTimes(1);
    expect(toastMock.error).toHaveBeenCalledWith('Lưu thất bại. Vui lòng thử lại.', undefined);
  });

  it('toasts a static successMessage and still runs the caller’s onSuccess', async () => {
    const onSuccess = vi.fn();
    const { result } = renderWithClient(() =>
      useApiMutation({
        mutationFn: () => Promise.resolve('ok'),
        errorFallback: 'unused',
        successMessage: 'Đã lưu',
        onSuccess,
      }),
    );

    act(() => result.current.mutate(undefined));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(toastMock.success).toHaveBeenCalledTimes(1);
    expect(toastMock.success).toHaveBeenCalledWith('Đã lưu', undefined);
    expect(onSuccess).toHaveBeenCalledWith('ok', undefined);
  });

  it('resolves a functional successMessage from (data, variables)', async () => {
    const { result } = renderWithClient(() =>
      useApiMutation({
        mutationFn: ({ id }: { id?: string }) => Promise.resolve({ id }),
        errorFallback: 'unused',
        successMessage: (_data, variables) => (variables.id === undefined ? 'Đã thêm' : 'Đã cập nhật'),
      }),
    );

    act(() => result.current.mutate({ id: 'addr-1' }));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(toastMock.success).toHaveBeenCalledWith('Đã cập nhật', undefined);
  });

  it('stays silent on success when successMessage is omitted', async () => {
    const { result } = renderWithClient(() => useApiMutation({ mutationFn: () => Promise.resolve('ok'), errorFallback: 'unused' }));

    act(() => result.current.mutate(undefined));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(toastMock.success).not.toHaveBeenCalled();
  });
});
