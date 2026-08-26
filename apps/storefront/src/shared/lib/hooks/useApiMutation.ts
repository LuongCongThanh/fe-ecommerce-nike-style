'use client';

import { notify } from '@repo/shared/notification';
import { useMutation, type UseMutationOptions } from '@tanstack/react-query';

import { ApiError } from '@/shared/lib/errors/api-error';

interface ApiMutationOptions<TData, TVariables> extends Omit<UseMutationOptions<TData, unknown, TVariables>, 'onSuccess'> {
  /** Shown on failure unless the error is an `ApiError` with its own message. */
  errorFallback: string;
  /** Shown on success, in addition to whatever `onSuccess` already does. Omit for a silent success. */
  successMessage?: string | ((data: TData, variables: TVariables) => string);
  onSuccess?: (data: TData, variables: TVariables) => void | Promise<void>;
}

/**
 * The one place a storefront mutation gets its result toast from. Every `useMutation` call in the app
 * used to re-derive `error instanceof ApiError ? error.message : fallback` by hand — and, because
 * `query-client.ts` also toasted a generic error on every mutation by default, each failure showed
 * *two* toasts. `useApiMutation` is that error branch, written once; the query client's default no
 * longer toasts at all, so there's exactly one place a mutation's outcome reaches the user.
 */
export function useApiMutation<TData, TVariables = void>({
  errorFallback,
  successMessage,
  onSuccess,
  ...options
}: ApiMutationOptions<TData, TVariables>) {
  return useMutation<TData, unknown, TVariables>({
    ...options,
    onError: (error) => {
      notify.error(error instanceof ApiError ? error.message : errorFallback);
    },
    onSuccess: async (data, variables) => {
      if (successMessage !== undefined) {
        notify.success(typeof successMessage === 'function' ? successMessage(data, variables) : successMessage);
      }
      await onSuccess?.(data, variables);
    },
  });
}
