// @vitest-environment node
import { describe, expect, it } from 'vitest';

import { realRunner, trimLog } from './exec';

describe('realRunner', () => {
  it('feeds `input` to stdin (hooks read their event there)', async () => {
    const r = await realRunner('cat', [], { cwd: process.cwd(), input: '{"a":1}' });
    expect(r).toMatchObject({ code: 0, stdout: '{"a":1}' });
  });
  it('reports a missing command as exit 127', async () => {
    expect((await realRunner('definitely-not-a-command', [], { cwd: process.cwd() })).code).toBe(127);
  });
});

describe('trimLog', () => {
  it('keeps the tail with a marker', () => {
    expect(trimLog('a'.repeat(10) + 'END', 3)).toBe('[... 10 chars trimmed]\nEND');
  });
});
