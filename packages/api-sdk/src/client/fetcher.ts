import { ApiError } from './api-error';

/** Baseline per FE-EXECUTION.md §2.7, extended to throw a typed `ApiError` parsed against the shared error envelope. */
export async function fetcher<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    credentials: 'include',
  });

  if (!response.ok) {
    throw await ApiError.fromResponse(response);
  }

  return response.json() as Promise<T>;
}
