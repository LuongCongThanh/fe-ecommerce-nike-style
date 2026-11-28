// @vitest-environment node
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { expect, it } from 'vitest';

import { prepareCheckout } from './checkout';
import { realRunner, type Runner } from './exec';
import { updateState } from './state';
import type { Task } from './tasks';

it('switches two task branches in one Git checkout, preserving local edits and ignored files', async () => {
  const root = mkdtempSync(join(tmpdir(), 'storefront-checkout-'));
  const calls: string[][] = [];
  const run: Runner = (cmd, args, options) => {
    if (cmd === 'corepack') return Promise.resolve({ code: 0, stdout: '', stderr: '' });
    calls.push(args);
    return realRunner(cmd, args, options);
  };
  const git = async (...args: string[]) => {
    const result = await realRunner('git', args, { cwd: root });
    expect(result.code, result.stderr).toBe(0);
    return result.stdout;
  };
  const task = (name: string): Task => ({
    name,
    number: name.slice(0, 2),
    status: 'ready-for-agent',
    blockedBy: [],
    kind: 'logic',
    specPath: '',
  });
  try {
    await git('init', '-q', '-b', 'dev');
    await git('config', 'user.name', 'Checkout test');
    await git('config', 'user.email', 'checkout@example.invalid');
    await git('config', 'commit.gpgsign', 'false');
    await git('remote', 'add', 'origin', root);
    mkdirSync(join(root, 'scripts/agent-run'), { recursive: true });
    writeFileSync(join(root, 'scripts/agent-run/checkout.ts'), '');
    writeFileSync(join(root, '.gitignore'), '.agent-run/\n.env.local\n');
    writeFileSync(join(root, 'tracked.txt'), 'base\n');
    await git('add', '-A');
    await git('commit', '-qm', 'base');
    writeFileSync(join(root, '.env.local'), 'KEEP\n');

    const first = task('01-first');
    const second = task('02-second');
    const prep = (t: Task) => prepareCheckout({ runner: run }, { repoRoot: root }, t, `feat/${t.name}`, '---\nstatus: ready-for-agent\n---\n');
    expect(await prep(first)).toMatchObject({ worktree: root, fresh: true });
    await expect(prep(second)).rejects.toMatchObject({ situation: 16 });
    expect(await prep(first)).toMatchObject({ worktree: root, fresh: false });

    updateState(root, (s) => {
      s.stage = 'done';
    });
    writeFileSync(join(root, 'tracked.txt'), 'local edit\n');
    await expect(prep(second)).rejects.toMatchObject({ situation: 16 });
    expect(readFileSync(join(root, 'tracked.txt'), 'utf8')).toBe('local edit\n');
    await git('add', 'tracked.txt', 'docs/plan/tasks/todo');
    await git('commit', '-qm', 'first task');

    expect(await prep(second)).toMatchObject({ worktree: root, fresh: true });
    expect((await git('branch', '--show-current')).trim()).toBe('feat/02-second');
    expect(readFileSync(join(root, 'tracked.txt'), 'utf8')).toBe('base\n');
    expect(readFileSync(join(root, '.env.local'), 'utf8')).toBe('KEEP\n');
    expect(calls.some(([command]) => command === 'worktree')).toBe(false);
    expect((await git('worktree', 'list', '--porcelain')).match(/^worktree /gm)).toHaveLength(1);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
