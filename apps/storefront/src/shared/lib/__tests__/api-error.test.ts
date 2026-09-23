import { describe, expect, it } from 'vitest';

import { ApiError } from '@/shared/lib/errors/api-error';

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
