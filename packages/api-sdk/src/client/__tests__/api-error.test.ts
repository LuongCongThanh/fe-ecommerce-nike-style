import { describe, expect, it } from 'vitest';

import { ApiError } from '../api-error';

describe('ApiError.fromResponse', () => {
  it('parses a response matching the shared error envelope', async () => {
    const response = new Response(JSON.stringify({ error: { code: 'NOT_FOUND', message: 'Product not found' } }), {
      status: 404,
    });

    const error = await ApiError.fromResponse(response);

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(404);
    expect(error.code).toBe('NOT_FOUND');
    expect(error.message).toBe('Product not found');
  });

  it('carries optional details through', async () => {
    const response = new Response(JSON.stringify({ error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: { field: 'email' } } }), {
      status: 422,
    });

    const error = await ApiError.fromResponse(response);

    expect(error.details).toEqual({ field: 'email' });
  });

  it('falls back to UNKNOWN_ERROR when the body does not match the envelope', async () => {
    const response = new Response('not json', { status: 500 });

    const error = await ApiError.fromResponse(response);

    expect(error.status).toBe(500);
    expect(error.code).toBe('UNKNOWN_ERROR');
  });
});
