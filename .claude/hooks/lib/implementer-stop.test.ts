// @vitest-environment node
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import type { Runner } from '../../../scripts/agent-run/exec';
import { readState, updateState } from '../../../scripts/agent-run/state';

import { evaluateStop, MAX_FIX_ATTEMPTS, parseNameStatus } from './implementer-stop';

let root: string;
let taskDir: string;
beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'stop-'));
  taskDir = join(root, 'task');
  mkdirSync(taskDir);
});
afterEach(() => rmSync(root, { recursive: true, force: true }));

const spec = (kind: string, extra = '') => writeFileSync(join(taskDir, 'spec.md'), `---\nkind: ${kind}\n${extra}---\n`);
const env = (over: Record<string, string> = {}) => ({ AGENT_RUN: '1', AGENT_PHASE: 'implement', AGENT_TASK_DIR: taskDir, ...over });

interface Fake {
  nameStatus?: string;
  untracked?: string;
  typecheck?: number;
  related?: number;
}
function fake(f: Fake = {}) {
  const calls: string[] = [];
  const runner: Runner = async (cmd, args) => {
    const line = [cmd, ...args].join(' ');
    calls.push(line);
    if (line === 'git merge-base HEAD origin/dev') return { code: 0, stdout: 'base123\n', stderr: '' };
    if (line.startsWith('git diff --name-status')) return { code: 0, stdout: f.nameStatus ?? '', stderr: '' };
    if (line.startsWith('git ls-files --others')) return { code: 0, stdout: f.untracked ?? '', stderr: '' };
    if (line === 'pnpm typecheck') return { code: f.typecheck ?? 0, stdout: '', stderr: f.typecheck ? 'TS2322 bad' : '' };
    if (line.startsWith('pnpm exec vitest related')) return { code: f.related ?? 0, stdout: f.related ? 'FAIL x.test.ts' : '', stderr: '' };
    return { code: 0, stdout: '', stderr: '' };
  };
  return { runner, calls };
}
const stop = (f: Fake, e: Record<string, string> = env()) => {
  const r = fake(f);
  return evaluateStop({ root, env: e, runner: r.runner }).then((d) => ({ d, calls: r.calls }));
};

describe('parseNameStatus', () => {
  it('parses status and path per line', () => {
    expect(parseNameStatus('M\ta.ts\nD\tb.test.ts\n')).toEqual([
      { status: 'M', path: 'a.ts' },
      { status: 'D', path: 'b.test.ts' },
    ]);
  });
});

describe('evaluateStop gating', () => {
  it('skips outside agent runs and in other phases (retro)', async () => {
    spec('logic');
    for (const e of [{}, env({ AGENT_RUN: '0' }), env({ AGENT_PHASE: 'retro' }), env({ AGENT_PHASE: 'plan' })]) {
      const { d, calls } = await stop({ typecheck: 1 }, e);
      expect(d.allow).toBe(true);
      expect(calls).toEqual([]);
    }
  });

  it('allows without running anything once fixAttempts reached the limit', async () => {
    spec('logic');
    updateState(root, (s) => (s.fixAttempts = MAX_FIX_ATTEMPTS));
    const { d, calls } = await stop({ typecheck: 1 });
    expect(d.allow).toBe(true);
    expect(calls).toEqual([]);
  });
});

describe('evaluateStop checks', () => {
  it('green: typecheck + related run on changed source files, stop allowed, counter untouched', async () => {
    spec('logic');
    const { d, calls } = await stop({ nameStatus: 'M\tsrc/a.ts\nA\tsrc/a.test.ts\nD\tsrc/gone.ts\n', untracked: 'src/new.ts\n' });
    expect(d).toEqual({ allow: true });
    expect(calls).toContain('pnpm typecheck');
    expect(calls).toContain('pnpm exec vitest related --run --passWithNoTests src/a.ts src/a.test.ts src/new.ts');
    expect(readState(root).fixAttempts).toBeUndefined();
  });

  it('red typecheck blocks with the reason and increments fixAttempts', async () => {
    spec('logic');
    const { d } = await stop({ typecheck: 1, nameStatus: 'A\tsrc/a.test.ts\n' });
    expect(d.allow).toBe(false);
    expect(d.allow ? '' : d.reason).toContain('TS2322 bad');
    expect(readState(root).fixAttempts).toBe(1);
  });

  it('red related tests block', async () => {
    spec('refactor');
    const { d } = await stop({ related: 1, nameStatus: 'M\tsrc/a.ts\n' });
    expect(d.allow).toBe(false);
    expect(d.allow ? '' : d.reason).toContain('FAIL x.test.ts');
  });

  it('third consecutive red still blocks (count 3); the next stop is allowed', async () => {
    spec('logic');
    for (let i = 1; i <= MAX_FIX_ATTEMPTS; i++) {
      expect((await stop({ typecheck: 1 })).d.allow).toBe(false);
      expect(readState(root).fixAttempts).toBe(i);
    }
    expect((await stop({ typecheck: 1 })).d.allow).toBe(true);
  });

  it('preserves other state keys', async () => {
    spec('logic');
    updateState(root, (s) => (s.turns = 7));
    await stop({ typecheck: 1 });
    expect(readState(root).turns).toBe(7);
  });

  it.each(['logic', 'ui'])('kind %s needs a new or modified test file', async (kind) => {
    spec(kind);
    const none = await stop({ nameStatus: 'M\tsrc/a.ts\n' });
    expect(none.d.allow).toBe(false);
    expect(none.d.allow ? '' : none.d.reason).toMatch(/\*\.test\.ts/);
    expect((await stop({ nameStatus: 'M\tsrc/a.ts\nM\tsrc/a.test.tsx\n' })).d.allow).toBe(true);
    expect((await stop({ untracked: 'src/b.test.ts\n' })).d.allow).toBe(true);
  });

  it('a deleted test does not satisfy the logic/ui rule', async () => {
    spec('logic');
    expect((await stop({ nameStatus: 'D\tsrc/a.test.ts\n' })).d.allow).toBe(false);
  });

  it('refactor: no test needed, but deleting/modifying tests is blocked unless the spec allows', async () => {
    spec('refactor');
    expect((await stop({ nameStatus: 'M\tsrc/a.ts\n' })).d.allow).toBe(true);
    expect((await stop({ nameStatus: 'A\tsrc/new.test.ts\n' })).d.allow).toBe(true);
    const mod = await stop({ nameStatus: 'M\tsrc/a.test.ts\n' });
    expect(mod.d.allow).toBe(false);
    expect((await stop({ nameStatus: 'D\tsrc/a.test.ts\n' })).d.allow).toBe(false);
    spec('refactor', 'allow-test-changes: true\n');
    expect((await stop({ nameStatus: 'D\tsrc/a.test.ts\n' })).d.allow).toBe(true);
  });

  it('docs: no test-file rule', async () => {
    spec('docs');
    const { d } = await stop({ nameStatus: 'M\tdocs/a.md\n' });
    expect(d.allow).toBe(true);
  });

  it('related is skipped when no source file changed', async () => {
    spec('docs');
    const { calls } = await stop({ nameStatus: 'M\tdocs/a.md\n' });
    expect(calls.some((c) => c.includes('vitest related'))).toBe(false);
  });

  it('unknown kind: typecheck + related still run, test-file rule skipped', async () => {
    writeFileSync(join(taskDir, 'spec.md'), 'no frontmatter');
    expect((await stop({ nameStatus: 'M\tsrc/a.ts\n' })).d.allow).toBe(true);
    expect((await stop({ typecheck: 1 })).d.allow).toBe(false);
  });

  it('merge-base fallback: uses HEAD when no origin/dev or dev exists', async () => {
    spec('docs');
    const calls: string[] = [];
    const runner: Runner = async (cmd, args) => {
      const line = [cmd, ...args].join(' ');
      calls.push(line);
      return { code: line.startsWith('git merge-base') ? 1 : 0, stdout: '', stderr: '' };
    };
    await evaluateStop({ root, env: env(), runner });
    expect(calls).toContain('git diff --name-status --no-renames HEAD');
  });
});
