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
