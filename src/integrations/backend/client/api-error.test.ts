import { describe, expect, it } from 'vitest';

import { ApiError } from '@/integrations/backend/client/api-error';

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

describe('ApiError', () => {
  it('is an instance of Error with name ApiError', () => {
    const err = new ApiError(500, 'UNKNOWN_ERROR', 'something broke');

    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe('ApiError');
    expect(err.message).toBe('something broke');
  });

  it('stores status, code, and details', () => {
    const err = new ApiError(400, 'required', 'bad request', { field: 'email' });

    expect(err.status).toBe(400);
    expect(err.code).toBe('required');
    expect(err.details).toEqual({ field: 'email' });
  });

  it('isUnauthorized for 401', () => {
    expect(new ApiError(401, 'UNKNOWN_ERROR', '').isUnauthorized).toBe(true);
    expect(new ApiError(403, 'UNKNOWN_ERROR', '').isUnauthorized).toBe(false);
  });

  it('isForbidden for 403', () => {
    expect(new ApiError(403, 'UNKNOWN_ERROR', '').isForbidden).toBe(true);
    expect(new ApiError(401, 'UNKNOWN_ERROR', '').isForbidden).toBe(false);
  });

  it('isNotFound for 404', () => {
    expect(new ApiError(404, 'UNKNOWN_ERROR', '').isNotFound).toBe(true);
    expect(new ApiError(200, 'UNKNOWN_ERROR', '').isNotFound).toBe(false);
  });

  it('isValidation for 400 and 422', () => {
    expect(new ApiError(400, 'UNKNOWN_ERROR', '').isValidation).toBe(true);
    expect(new ApiError(422, 'UNKNOWN_ERROR', '').isValidation).toBe(true);
    expect(new ApiError(404, 'UNKNOWN_ERROR', '').isValidation).toBe(false);
  });

  it('isServerError for 500 and above', () => {
    expect(new ApiError(500, 'UNKNOWN_ERROR', '').isServerError).toBe(true);
    expect(new ApiError(503, 'UNKNOWN_ERROR', '').isServerError).toBe(true);
    expect(new ApiError(499, 'UNKNOWN_ERROR', '').isServerError).toBe(false);
  });
});
