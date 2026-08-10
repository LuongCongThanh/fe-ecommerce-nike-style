import { ApiError as SdkApiError } from '@repo/api-sdk/client/error';

import { ApiError } from '@/shared/lib/errors/api-error';

export function toStorefrontApiError(error: unknown): unknown {
  if (error instanceof SdkApiError) {
    return new ApiError({
      message: error.message,
      status: error.status,
      code: error.code,
      details: error.details,
    });
  }

  return error;
}

/**
 * Wraps an `@repo/api-sdk` endpoint call so its `SdkApiError` crosses the seam translated into the
 * storefront's own `ApiError` — the one thing every `_lib/api/*` adapter action was hand-repeating in
 * its own try/catch. Use it once per action instead of copying the try/catch.
 */
export function withApiErrorTranslation<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
): (...args: TArgs) => Promise<TResult> {
  return async (...args: TArgs) => {
    try {
      return await fn(...args);
    } catch (error) {
      throw toStorefrontApiError(error);
    }
  };
}
