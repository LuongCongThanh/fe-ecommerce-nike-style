'use client';

import { useState } from 'react';

import { ApiError } from '@/shared/lib/errors/api-error';

export function useApiErrorMessage() {
  const [apiError, setApiError] = useState<string | null>(null);

  function handleApiError(err: unknown, fallbackMessage: string): void {
    setApiError(err instanceof ApiError ? err.message : fallbackMessage);
  }

  return { apiError, setApiError, handleApiError };
}
