import { describe, expect, it } from 'vitest';

import { PaginationMetaSchema, PaginationQuerySchema } from '../pagination';

describe('PaginationQuerySchema', () => {
  it('defaults page to 1 and pageSize to 20 when omitted', () => {
    const result = PaginationQuerySchema.parse({});

    expect(result).toEqual({ page: 1, pageSize: 20 });
  });

  it('rejects a page below 1', () => {
    const result = PaginationQuerySchema.safeParse({ page: 0 });

    expect(result.success).toBe(false);
  });

  it('rejects a pageSize above 100', () => {
    const result = PaginationQuerySchema.safeParse({ pageSize: 101 });

    expect(result.success).toBe(false);
  });
});

describe('PaginationMetaSchema', () => {
  it('accepts a valid pagination meta', () => {
    const result = PaginationMetaSchema.safeParse({ page: 1, pageSize: 20, total: 42, totalPages: 3 });

    expect(result.success).toBe(true);
  });
});
