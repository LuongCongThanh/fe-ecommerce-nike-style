// @vitest-environment node
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { guardPreflight } from './preflight';
import { fakeRunner, on } from './testkit';
import { readState, recordBlock } from './state';

const dirs: string[] = [];
function wt(withTsx = true): string {
  const d = mkdtempSync(join(tmpdir(), 'pf-'));
  dirs.push(d);
  if (withTsx) {
    mkdirSync(join(d, 'node_modules/.bin'), { recursive: true });
    writeFileSync(join(d, 'node_modules/.bin/tsx'), '');
  }
  return d;
}
afterEach(() => dirs.splice(0).forEach((d) => rmSync(d, { recursive: true, force: true })));

describe('guardPreflight (situation 13)', () => {
  it('passes when the hook blocks a denied path (exit 2) and sends the event on stdin', async () => {
    const d = wt();
    const f = fakeRunner(on('', { code: 2, stderr: 'denied' }));
    await guardPreflight({ runner: f.runner }, d, join(d, 'docs/plan/tasks/01-a'));
    expect(f.opts[0]?.input).toContain('"tool_name":"Edit"');
    expect(f.opts[0]?.env).toMatchObject({ AGENT_RUN: '1', AGENT_PHASE: 'implement', CLAUDE_PROJECT_DIR: d });
    expect(f.calls[0]).toContain('agent-guard.ts');
  });
  it('fails when the hook does not block', async () => {
    const d = wt();
    const f = fakeRunner(on('', { code: 0 }));
    await expect(guardPreflight({ runner: f.runner }, d, d)).rejects.toMatchObject({ situation: 13 });
  });
  it('fails when tsx is missing, without running anything', async () => {
    const d = wt(false);
    const f = fakeRunner();
    await expect(guardPreflight({ runner: f.runner }, d, d)).rejects.toMatchObject({ situation: 13 });
    expect(f.calls).toEqual([]);
  });
  it('drops the block the probe recorded, keeping the rest of the state', async () => {
    const d = wt();
    recordBlock(d, { tool: 'Edit', target: 'pnpm-lock.yaml' });
    const f = fakeRunner(on('', { code: 2 }));
    await guardPreflight({ runner: f.runner }, d, d);
    expect(readState(d).blocks).toEqual([]);
  });
});
