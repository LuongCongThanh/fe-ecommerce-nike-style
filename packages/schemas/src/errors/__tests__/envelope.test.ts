import { describe, expect, it } from 'vitest';

import { ErrorEnvelopeSchema } from '../envelope';

describe('ErrorEnvelopeSchema', () => {
  it('accepts a valid error envelope', () => {
    const result = ErrorEnvelopeSchema.safeParse({
      error: { code: 'NOT_FOUND', message: 'Product not found' },
    });

    expect(result.success).toBe(true);
  });

  it('accepts optional details', () => {
    const result = ErrorEnvelopeSchema.safeParse({
      error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: { field: 'email' } },
    });

    expect(result.success).toBe(true);
  });

  it('rejects an envelope missing the error message', () => {
    const result = ErrorEnvelopeSchema.safeParse({ error: { code: 'NOT_FOUND' } });

    expect(result.success).toBe(false);
  });

  it('rejects a response with no error field', () => {
    const result = ErrorEnvelopeSchema.safeParse({ data: [] });

    expect(result.success).toBe(false);
  });
});
