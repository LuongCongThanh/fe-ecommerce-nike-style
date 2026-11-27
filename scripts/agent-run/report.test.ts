// @vitest-environment node
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { appendInbox, reportStop, setTaskStatus } from './report';
import { Stop } from './situations';
import { updateState } from './state';

const dirs: string[] = [];
function repo(): { root: string; spec: string; wt: string } {
  const root = mkdtempSync(join(tmpdir(), 'rep-'));
  dirs.push(root);
  mkdirSync(join(root, 'docs/storefront/plan/todo/03-x'), { recursive: true });
  const spec = join(root, 'docs/storefront/plan/todo/03-x/spec.md');
  writeFileSync(spec, '---\nstatus: in-progress\n---\n# Spec\n');
  mkdirSync(join(root, '.agent-run'), { recursive: true });
  writeFileSync(join(root, '.agent-run/AGENT-INBOX.md'), '| Thời gian | Task | Tình huống | Việc cần làm |\n| --- | --- | --- | --- |\n');
  const wt = join(root, 'wt');
  mkdirSync(wt);
  return { root, spec, wt };
}
afterEach(() => dirs.splice(0).forEach((d) => rmSync(d, { recursive: true, force: true })));
const when = new Date(2026, 10, 16, 10, 5);

describe('appendInbox (D22)', () => {
  it('appends one table row, escaping pipes and newlines', () => {
    const { root } = repo();
    appendInbox(root, when, '03-x', 5, 'trả lời | câu hỏi\nở spec');
    const text = readFileSync(join(root, '.agent-run/AGENT-INBOX.md'), 'utf8');
    expect(text.trimEnd().split('\n').pop()).toBe('| 2026-11-16 10:05 | 03-x | 5 | trả lời \\| câu hỏi ở spec |');
  });
});

describe('reportStop', () => {
  const notified: [string, string][] = [];
  const notify = (t: string, b: string) => notified.push([t, b]);

  it('sets the status of the situation, writes inbox and notifies', () => {
    const { root, spec } = repo();
    notified.length = 0;
    reportStop({ repoRoot: root, taskName: '03-x', worktree: null, now: when, notify }, new Stop(7, 'sửa gate rồi chạy lại'));
    expect(readFileSync(spec, 'utf8')).toContain('status: blocked');
    expect(readFileSync(join(root, '.agent-run/AGENT-INBOX.md'), 'utf8')).toContain('| 03-x | 7 | sửa gate rồi chạy lại |');
    expect(notified).toHaveLength(1);
  });
  it('situation 10: no inbox, no notification, task goes back to ready-for-agent', () => {
    const { root, spec } = repo();
    notified.length = 0;
    reportStop({ repoRoot: root, taskName: '03-x', worktree: null, now: when, notify }, new Stop(10, 'xóa .agent-stop'));
    expect(readFileSync(spec, 'utf8')).toContain('status: ready-for-agent');
    expect(readFileSync(join(root, '.agent-run/AGENT-INBOX.md'), 'utf8')).not.toContain('03-x');
    expect(notified).toHaveLength(0);
  });
  it('situation 1 has no task: inbox row with "-"', () => {
    const { root } = repo();
    reportStop({ repoRoot: root, taskName: null, worktree: null, now: when, notify }, new Stop(1, 'đặt một task ready-for-agent'));
    expect(readFileSync(join(root, '.agent-run/AGENT-INBOX.md'), 'utf8')).toContain('| - | 1 |');
  });
  it('after 2 resumes a needs-info/blocked stop becomes ready-for-human (D43)', () => {
    const { root, spec, wt } = repo();
    updateState(wt, (s) => (s.resumeCount = 2));
    reportStop({ repoRoot: root, taskName: '03-x', worktree: wt, now: when, notify }, new Stop(7, 'x'));
    expect(readFileSync(spec, 'utf8')).toContain('status: ready-for-human');
  });
  it('situation 15 is exempt from ready-for-human', () => {
    const { root, spec, wt } = repo();
    updateState(wt, (s) => (s.resumeCount = 2));
    reportStop({ repoRoot: root, taskName: '03-x', worktree: wt, now: when, notify }, new Stop(15, 'retro-turns'));
    expect(readFileSync(spec, 'utf8')).toContain('status: needs-info');
  });
  it('records the last stop in state.json', () => {
    const { root, wt } = repo();
    updateState(wt, () => undefined);
    reportStop({ repoRoot: root, taskName: '03-x', worktree: wt, now: when, notify }, new Stop(10, 'x'));
    expect(JSON.parse(readFileSync(join(wt, '.agent-run/state.json'), 'utf8')).lastStop).toMatchObject({ situation: 10 });
  });
});

describe('setTaskStatus', () => {
  it('edits the main checkout spec', () => {
    const { root, spec } = repo();
    setTaskStatus(root, '03-x', 'review', { pr: '#9' });
    const t = readFileSync(spec, 'utf8');
    expect(t).toContain('status: review');
    expect(t).toContain('pr: #9');
  });
});
