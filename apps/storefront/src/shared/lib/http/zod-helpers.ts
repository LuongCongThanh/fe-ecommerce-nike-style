import { z } from 'zod';

import { ApiError } from '@/shared/lib/errors/api-error';

export function validateResponse<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    throw new ApiError({
      message: 'Invalid API response shape',
      status: 500,
      code: 'INVALID_RESPONSE_SCHEMA',
      details: z.treeifyError(result.error),
    });
  }

  return result.data;
}
