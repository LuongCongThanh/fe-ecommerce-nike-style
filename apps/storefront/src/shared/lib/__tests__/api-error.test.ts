import { describe, expect, it } from 'vitest';

import { ApiError } from '@/shared/lib/errors/api-error';

describe('ApiError', () => {
  it('is an instance of Error with name ApiError', () => {
    const err = new ApiError({ message: 'something broke', status: 500 });

    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe('ApiError');
    expect(err.message).toBe('something broke');
  });

  it('stores status, code, and details', () => {
    const err = new ApiError({ message: 'bad request', status: 400, code: 'required', details: { field: 'email' } });

    expect(err.status).toBe(400);
    expect(err.code).toBe('required');
    expect(err.details).toEqual({ field: 'email' });
  });

  it('isUnauthorized for 401', () => {
    expect(new ApiError({ message: '', status: 401 }).isUnauthorized).toBe(true);
    expect(new ApiError({ message: '', status: 403 }).isUnauthorized).toBe(false);
  });

  it('isForbidden for 403', () => {
    expect(new ApiError({ message: '', status: 403 }).isForbidden).toBe(true);
    expect(new ApiError({ message: '', status: 401 }).isForbidden).toBe(false);
  });

  it('isNotFound for 404', () => {
    expect(new ApiError({ message: '', status: 404 }).isNotFound).toBe(true);
    expect(new ApiError({ message: '', status: 200 }).isNotFound).toBe(false);
  });

  it('isValidation for 400 and 422', () => {
    expect(new ApiError({ message: '', status: 400 }).isValidation).toBe(true);
    expect(new ApiError({ message: '', status: 422 }).isValidation).toBe(true);
    expect(new ApiError({ message: '', status: 404 }).isValidation).toBe(false);
  });

  it('isServerError for 500 and above', () => {
    expect(new ApiError({ message: '', status: 500 }).isServerError).toBe(true);
    expect(new ApiError({ message: '', status: 503 }).isServerError).toBe(true);
    expect(new ApiError({ message: '', status: 499 }).isServerError).toBe(false);
  });
});
