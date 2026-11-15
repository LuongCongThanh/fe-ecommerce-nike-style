// @vitest-environment node
import { describe, expect, it } from 'vitest';

import { setTimeout as sleep } from 'node:timers/promises';

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

describe('realRunner timeouts and decoding', () => {
  const alive = (pid: number) => {
    try {
      process.kill(pid, 0);
      return true;
    } catch {
      // ESRCH: no such process
      return false;
    }
  };

  it('kills the whole process group on timeout, not just the direct child', async () => {
    const r = await realRunner('sh', ['-c', 'sleep 30 & echo $!; wait'], { cwd: process.cwd(), timeoutMs: 400 });
    expect(r.code).toBe(124);
    const grandchild = Number(r.stdout.trim());
    expect(grandchild).toBeGreaterThan(0);
    await sleep(100);
    expect(alive(grandchild)).toBe(false);
  });

  it('decodes a multi-byte character split across chunks', async () => {
    const script = 'process.stdout.write(Buffer.from([0xe2, 0x82])); setTimeout(() => process.stdout.write(Buffer.from([0xac])), 60);';
    const r = await realRunner(process.execPath, ['-e', script], { cwd: process.cwd() });
    expect(r.stdout).toBe('\u20ac');
  });
});

describe('trimLog', () => {
  it('keeps the tail with a marker', () => {
    expect(trimLog('a'.repeat(10) + 'END', 3)).toBe('[... 10 chars trimmed]\nEND');
  });
});
