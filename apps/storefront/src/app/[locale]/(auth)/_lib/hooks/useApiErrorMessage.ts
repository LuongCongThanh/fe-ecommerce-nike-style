'use client';

import { useState } from 'react';

import { notify } from '@repo/shared/notification';

import { ApiError } from '@/shared/lib/errors/api-error';

/**
 * The interface used to be just `handleApiError`, which only set the inline alert — every call site
 * then re-derived `err instanceof ApiError ? err.message : fallback` a second time to drive the toast.
 * `reportApiError` is that one branch, computed once, driving both.
 */
export function useApiErrorMessage() {
  const [apiError, setApiError] = useState<string | null>(null);

  function reportApiError(err: unknown, fallbackMessage: string): void {
    const message = err instanceof ApiError ? err.message : fallbackMessage;
    setApiError(message);
    notify.error(message);
  }

  return { apiError, setApiError, reportApiError };
}
