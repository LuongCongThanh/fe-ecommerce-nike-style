import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { ApiError } from '@/shared/lib/errors/api-error';
import { validateResponse } from '@/shared/lib/http/zod-helpers';

describe('validateResponse', () => {
  const schema = z.object({ id: z.number(), name: z.string() });

  it('returns parsed data when input matches the schema', () => {
    const result = validateResponse(schema, { id: 1, name: 'Áo thun' });

    expect(result).toEqual({ id: 1, name: 'Áo thun' });
  });

  it('strips unknown fields not in the schema', () => {
    const result = validateResponse(schema, { id: 2, name: 'Quần', extra: true });

    expect(result).toEqual({ id: 2, name: 'Quần' });
  });

  it('throws ApiError with status 500 when schema validation fails', () => {
    expect(() => validateResponse(schema, { id: 'not-a-number', name: 'X' })).toThrow(ApiError);
  });

  it('throws with INVALID_RESPONSE_SCHEMA code on mismatch', () => {
    let caught: ApiError | undefined;
    try {
      validateResponse(schema, null);
    } catch (e) {
      caught = e as ApiError;
    }

    expect(caught?.code).toBe('INVALID_RESPONSE_SCHEMA');
    expect(caught?.status).toBe(500);
  });
});
