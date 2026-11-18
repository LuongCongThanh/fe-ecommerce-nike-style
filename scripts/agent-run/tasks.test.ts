// @vitest-environment node
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { branchFor, readTasks, selectTask, slugOf, type Task } from './tasks';

const dirs: string[] = [];
function repo(tasks: Record<string, string>): string {
  const root = mkdtempSync(join(tmpdir(), 'tasks-'));
  dirs.push(root);
  for (const [name, fm] of Object.entries(tasks)) {
    mkdirSync(join(root, 'docs/plan/tasks', name), { recursive: true });
    writeFileSync(join(root, 'docs/plan/tasks', name, 'spec.md'), `---\n${fm}\n---\n# Spec\n`);
  }
  return root;
}
afterEach(() => dirs.splice(0).forEach((d) => rmSync(d, { recursive: true, force: true })));

describe('selectTask (situations 1, 2)', () => {
  it('picks the first ready-for-agent task in name order', () => {
    const root = repo({ '02-b': 'status: ready-for-agent\nkind: logic', '01-a': 'status: ready-for-agent\nkind: ui' });
    const r = selectTask(readTasks(root));
    expect(r.task?.name).toBe('01-a');
  });
  it('skips tasks whose blocked-by are not done and reports them (situation 2)', () => {
    const root = repo({
      '01-a': 'status: review\nkind: ui',
      '02-b': 'status: ready-for-agent\nblocked-by: [01-a]\nkind: logic',
      '03-c': 'status: ready-for-agent\nblocked-by: []\nkind: logic',
    });
    const r = selectTask(readTasks(root));
    expect(r.task?.name).toBe('03-c');
    expect(r.skipped).toEqual([{ name: '02-b', waitingFor: ['01-a'] }]);
  });
  it('picks a task once blockers are done', () => {
    const root = repo({ '01-a': 'status: done', '02-b': 'status: ready-for-agent\nblocked-by: [01-a]\nkind: docs' });
    expect(selectTask(readTasks(root)).task?.name).toBe('02-b');
  });
  it('a missing blocker counts as not done', () => {
    const root = repo({ '02-b': 'status: ready-for-agent\nblocked-by: [09-zzz]\nkind: docs' });
    const r = selectTask(readTasks(root));
    expect(r.task).toBeNull();
    expect(r.skipped).toHaveLength(1);
  });
  it('no ready task -> null (situation 1)', () => {
    const root = repo({ '01-a': 'status: todo', '02-b': 'status: needs-info' });
    expect(selectTask(readTasks(root)).task).toBeNull();
  });
  it('--task NN selects by number prefix, still requiring ready + unblocked', () => {
    const root = repo({ '01-a': 'status: ready-for-agent\nkind: ui', '02-b': 'status: ready-for-agent\nkind: logic' });
    expect(selectTask(readTasks(root), '02').task?.name).toBe('02-b');
    expect(selectTask(readTasks(root), '07').task).toBeNull();
  });
  it.each([
    'labels: [wayfinder:map]',
    'labels:\n- wayfinder:map',
    'labels:\n  - "wayfinder:research"',
    'labels: [wayfinder:task]',
    'ignored: x\n---\nType: research\n',
  ])('excludes Wayfinder %s even when explicitly selected, retaining blocker status', (labels) => {
    const root = repo({ '01-map': `status: ready-for-agent\n${labels}`, '02-delivery': 'status: ready-for-agent\nkind: docs' });
    expect(selectTask(readTasks(root)).task?.name).toBe('02-delivery');
    expect(selectTask(readTasks(root), '01').task).toBeNull();
    expect(readTasks(root)).toHaveLength(2);
  });
  it('retains resolved and unresolved Wayfinder dependencies for delivery blockers', () => {
    const root = repo({
      '01-map': 'status: done\nlabels: [wayfinder:map]',
      '02-decision': 'status: todo\nlabels: [wayfinder:research]',
      '03-delivery': 'status: ready-for-agent\nblocked-by: [01-map, 02-decision]\nkind: docs',
      '04-ready': 'status: ready-for-agent\nblocked-by: [01-map]\nkind: docs',
    });
    const selection = selectTask(readTasks(root));
    expect(selection.task?.name).toBe('04-ready');
    expect(selection.skipped).toEqual([{ name: '03-delivery', waitingFor: ['02-decision'] }]);
  });
  it('missing tasks dir -> empty', () => {
    expect(readTasks(mkdtempSync(join(tmpdir(), 'empty-')))).toEqual([]);
  });
});

describe('branch naming (D9, D32)', () => {
  const t = (name: string, kind: Task['kind']): Task => ({
    name,
    number: name.slice(0, 2),
    status: 'ready-for-agent',
    blockedBy: [],
    kind,
    specPath: '',
  });
  it('derives type from kind', () => {
    expect(branchFor(t('03-product-card', 'ui'))).toBe('feat/03-product-card');
    expect(branchFor(t('03-x', 'logic'))).toBe('feat/03-x');
    expect(branchFor(t('04-y', 'refactor'))).toBe('refactor/04-y');
    expect(branchFor(t('05-z', 'docs'))).toBe('docs/05-z');
    expect(branchFor(t('06-w', null))).toBe('feat/06-w');
  });
  it('slugOf drops the number prefix', () => expect(slugOf('03-product-card')).toBe('product-card'));
});
