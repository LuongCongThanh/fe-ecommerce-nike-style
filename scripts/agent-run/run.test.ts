// @vitest-environment node
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { runAgent } from './run';
import { readState, recordBlock, updateState } from './state';
import { on } from './testkit';
import { makeWorld, PR_URL, reply, TASK_SPEC, type World } from './world';

const spec = (w: World, task = '01-demo') => readFileSync(join(w.repo, 'docs/plan/tasks', task, 'spec.md'), 'utf8');
const inbox = (w: World) => readFileSync(join(w.repo, 'docs/plan/AGENT-INBOX.md'), 'utf8');
const roles = (w: World) => w.claudeCalls.map((c) => c.role);
const gatesRed = (failures: number) => {
  let n = 0;
  return on('pnpm exec tsx scripts/verify-gates.ts', () => {
    n++;
    // 1st call is the pre-start check (green); the next `failures` calls are red
    return n === 1 || n > failures + 1
      ? { code: 0, stdout: '{}' }
      : { code: 1, stdout: JSON.stringify({ gates: [{ name: 'lint', status: 'fail', log: 'lint boom' }] }) };
  });
};

describe('happy path (D39: script commits once, pushes, opens PR into dev, never merges)', () => {
  it('runs plan -> implement -> gates -> review -> retro -> metric -> commit -> push -> PR', async () => {
    const w = makeWorld({ tasks: { '01-demo': TASK_SPEC('approved:\n  files: [package.json]\n  commands: ["pnpm add zod"]') } });
    const out = await runAgent(w.deps, w.cfg);
    expect(out).toEqual({ kind: 'pr', task: '01-demo', url: PR_URL });
    expect(roles(w)).toEqual(['planner', 'implementer', 'reviewer', 'retro', 'pr-body']);
    const wt = w.wt('01-demo');
    const c = w.runner.calls;
    const at = (p: string) => c.findIndex((x) => x.startsWith(p));
    expect(at('git worktree add -b feat/01-demo')).toBeGreaterThan(-1);
    expect(at(`pnpm tokens --project-dir ${wt} --out ${wt}/docs/plan/tasks/01-demo/metric.md`)).toBeGreaterThan(-1);
    expect(c.filter((x) => x.startsWith('git commit'))).toEqual(['git commit -m feat(demo): add the thing']);
    expect(at('git commit')).toBeGreaterThan(at('pnpm tokens'));
    expect(at('git push -u origin feat/01-demo')).toBeGreaterThan(at('git commit'));
    expect(at('gh pr create --base dev --head feat/01-demo')).toBeGreaterThan(at('git push'));
    expect(c.some((x) => /\bmerge\b/.test(x) && !x.includes('merge-base'))).toBe(false);
    expect(spec(w)).toMatch(/status: review/);
    expect(spec(w)).toMatch(/pr: #42/);
    expect(readFileSync(join(wt, 'docs/plan/tasks/01-demo/spec.md'), 'utf8')).toContain('status: review');
    expect(w.notices.some((n) => n.includes(PR_URL))).toBe(true);
  });

  it('passes env contract, remaining turns and the approved list to every call (D15, D43)', async () => {
    const w = makeWorld({ tasks: { '01-demo': TASK_SPEC('approved:\n  files: [package.json]\n  commands: ["pnpm add zod"]') } });
    await runAgent(w.deps, w.cfg);
    const [planner, impl, reviewer, retro] = w.claudeCalls.map((x) => x.req);
    expect(planner?.maxTurns).toBe(40);
    expect(impl?.maxTurns).toBe(37); // planner used 3
    expect(reviewer?.maxTurns).toBe(34);
    expect(planner?.env).toMatchObject({ AGENT_RUN: '1', AGENT_PHASE: 'plan' });
    expect(impl?.env).toMatchObject({ AGENT_PHASE: 'implement', AGENT_APPROVED: '{"paths":["package.json"],"commands":["pnpm add zod"]}' });
    expect(impl?.env.AGENT_TASK_DIR).toBe(join(w.wt('01-demo'), 'docs/plan/tasks/01-demo'));
    expect(reviewer?.env.AGENT_PHASE).toBe('review');
    expect(retro).toMatchObject({ resume: 'impl-1', maxTurns: 5, phase: 'retro' });
    expect(retro?.prompt).toContain('/mattpocock-skills:retro');
    expect(retro?.prompt).toContain('## Đề xuất cho môi trường');
  });

  it('PR body is validated with check-pr-body.sh using BODY, and the PR gets the commit subject as title', async () => {
    const w = makeWorld();
    await runAgent(w.deps, w.cfg);
    const i = w.runner.calls.indexOf('bash scripts/check-pr-body.sh');
    expect(w.runner.opts[i]?.env?.BODY).toBe('body');
    expect(w.runner.calls.find((x) => x.startsWith('gh pr create'))).toContain('--title feat(demo): add the thing');
  });

  it('replaces an invalid commit_message with a safe generated one', async () => {
    const w = makeWorld();
    w.script.implementer = () => reply({ result: 'ok', reason: 'x', commit_message: 'Added Claude hook.' }, { sessionId: 'impl-1' });
    await runAgent(w.deps, w.cfg);
    expect(w.runner.calls.filter((x) => x.startsWith('git commit'))).toEqual(['git commit -m feat: complete task 01 demo']);
  });
});

describe('selection (situations 1, 2)', () => {
  it('1: no ready task -> stopped, inbox line, notification, no worktree', async () => {
    const w = makeWorld({ tasks: { '01-demo': '---\nstatus: todo\n---\n' } });
    const out = await runAgent(w.deps, w.cfg);
    expect(out).toMatchObject({ kind: 'stopped', situation: 1, task: null });
    expect(inbox(w)).toContain('| - | 1 |');
    expect(w.notices).toHaveLength(1);
    expect(w.runner.calls).toEqual([]);
  });
  it('2: skips a task whose blocker is not done and runs the next, without telling the human', async () => {
    const w = makeWorld({
      tasks: { '01-a': '---\nstatus: review\n---\n', '02-b': TASK_SPEC('blocked-by: [01-a]'), '03-c': TASK_SPEC('') },
    });
    const out = await runAgent(w.deps, w.cfg);
    expect(out).toMatchObject({ kind: 'pr', task: '03-c' });
    expect(spec(w, '02-b')).toContain('status: ready-for-agent');
    expect(w.logs.some((l) => l.includes('situation 2') && l.includes('02-b'))).toBe(true);
    expect(inbox(w)).not.toContain('02-b');
  });
});

describe('before the agent starts (situations 3, 4, 13)', () => {
  it('3: pre-start gates red -> blocked, no claude call', async () => {
    const w = makeWorld({ handlers: [on('pnpm exec tsx scripts/verify-gates.ts', { code: 1, stdout: '{"gates":[]}' })] });
    const out = await runAgent(w.deps, w.cfg);
    expect(out).toMatchObject({ kind: 'stopped', situation: 3 });
    expect(spec(w)).toContain('status: blocked');
    expect(w.claudeCalls).toHaveLength(0);
  });
  it('3: dev server port busy for a ui task -> blocked, server never counted as stopped twice', async () => {
    const w = makeWorld({ tasks: { '01-demo': TASK_SPEC('').replace('kind: logic', 'kind: ui') } });
    w.devServer.busy = true;
    const out = await runAgent(w.deps, w.cfg);
    expect(out).toMatchObject({ kind: 'stopped', situation: 3 });
    expect(roles(w)).toEqual(['planner', 'implementer']);
  });
  it('4: worktree dir exists without state.json -> blocked, nothing overwritten', async () => {
    const w = makeWorld();
    mkdirSync(w.wt('01-demo'));
    const out = await runAgent(w.deps, w.cfg);
    expect(out).toMatchObject({ kind: 'stopped', situation: 4 });
    expect(spec(w)).toContain('status: blocked');
    expect(existsSync(join(w.wt('01-demo'), '.agent-run'))).toBe(false);
  });
  it('13: the guard hook does not block -> stop before any agent call', async () => {
    const w = makeWorld({
      handlers: [(cmd, args) => (cmd.endsWith('.bin/tsx') && args[0]?.endsWith('agent-guard.ts') ? { code: 1, stderr: 'crash' } : undefined)],
    });
    const out = await runAgent(w.deps, w.cfg);
    expect(out).toMatchObject({ kind: 'stopped', situation: 13 });
    expect(w.claudeCalls).toHaveLength(0);
  });
  it('13: any unexpected exception is a catch-all stop with the raw error', async () => {
    const w = makeWorld();
    w.script.planner = () => {
      throw new Error('kaboom raw');
    };
    const out = await runAgent(w.deps, w.cfg);
    expect(out).toMatchObject({ kind: 'stopped', situation: 13 });
    expect(out.kind === 'stopped' && out.action).toContain('kaboom raw');
    expect(inbox(w)).toContain('| 01-demo | 13 |');
  });
});

describe('agent asks or is denied (situations 5, 6)', () => {
  it('5: planner need_info -> needs-info and the questions are written into the spec', async () => {
    const w = makeWorld();
    w.script.planner = () => reply({ result: 'need_info', reason: 'unclear', questions: ['Giá có VAT không?', 'Tối đa mấy ảnh?'] });
    const out = await runAgent(w.deps, w.cfg);
    expect(out).toMatchObject({ kind: 'stopped', situation: 5 });
    expect(spec(w)).toContain('status: needs-info');
    expect(spec(w)).toMatch(/## Câu hỏi cho người duyệt \(planner, 2026-11-16 09:30\)\n\n- Giá có VAT không\?\n- Tối đa mấy ảnh\?/);
    expect(roles(w)).toEqual(['planner']);
  });
  it('6: planner needs_approval -> needs-info', async () => {
    const w = makeWorld();
    w.script.planner = () => reply({ result: 'blocked', reason: 'needs_approval: package.json' });
    expect(await runAgent(w.deps, w.cfg)).toMatchObject({ situation: 6 });
    expect(spec(w)).toContain('status: needs-info');
  });
  it('6: implementer needs_approval lists what it asked for', async () => {
    const w = makeWorld();
    w.script.implementer = () => reply({ result: 'blocked', reason: 'needs_approval', requested: { paths: ['next.config.ts'], commands: [] } });
    const out = await runAgent(w.deps, w.cfg);
    expect(out).toMatchObject({ situation: 6 });
    expect(out.kind === 'stopped' && out.action).toContain('next.config.ts');
  });
  it('13: structured output that is not valid is a catch-all stop', async () => {
    const w = makeWorld();
    w.script.implementer = () => reply({ result: 'maybe' });
    expect(await runAgent(w.deps, w.cfg)).toMatchObject({ situation: 13 });
  });
});

describe('fix loop (situations 7, 14; D19)', () => {
  it('red gate -> resumes the implementer session to fix; green afterwards', async () => {
    const w = makeWorld({ handlers: [gatesRed(1)] });
    const out = await runAgent(w.deps, w.cfg);
    expect(out.kind).toBe('pr');
    const fixes = w.claudeCalls.filter((c) => c.role === 'implementer');
    expect(fixes).toHaveLength(2);
    expect(fixes[1]?.req.resume).toBe('impl-1');
    expect(fixes[1]?.req.prompt).toContain('lint boom');
    expect(fixes[1]?.req.prompt).toContain('mattpocock-skills:diagnosing-bugs');
    expect(readState(w.wt('01-demo')).fixAttempts).toBe(1);
  });
  it('7: still red after 3 fixes -> blocked', async () => {
    const w = makeWorld({ handlers: [gatesRed(99)] });
    const out = await runAgent(w.deps, w.cfg);
    expect(out).toMatchObject({ kind: 'stopped', situation: 7 });
    expect(w.claudeCalls.filter((c) => c.role === 'implementer')).toHaveLength(4); // 1 build + 3 fixes
    expect(spec(w)).toContain('status: blocked');
    expect(roles(w)).not.toContain('reviewer');
  });
  it('the fix counter is shared with the Stop hook: 2 hook blocks leave only 1 fix', async () => {
    const w = makeWorld({ handlers: [gatesRed(99)] });
    w.script.implementer = (req, n) => {
      if (n === 1) updateState(req.cwd, (s) => (s.fixAttempts = 2));
    };
    await runAgent(w.deps, w.cfg);
    expect(w.claudeCalls.filter((c) => c.role === 'implementer')).toHaveLength(2);
  });
  it('14: bundle regression -> needs-info, no fix call', async () => {
    const report = { bundle: { regressions: [{ route: '/', baseline: 100, current: 130, increasePct: 30 }] } };
    const w = makeWorld({
      tasks: { '01-demo': TASK_SPEC('').replace('kind: logic', 'kind: ui') },
      handlers: [
        (() => {
          let n = 0;
          return on('pnpm exec tsx scripts/verify-gates.ts', () => (++n === 1 ? { code: 0 } : { code: 2, stdout: JSON.stringify(report) }));
        })(),
      ],
    });
    const out = await runAgent(w.deps, w.cfg);
    expect(out).toMatchObject({ kind: 'stopped', situation: 14 });
    expect(out.kind === 'stopped' && out.action).toContain('/ +30.0%');
    expect(spec(w)).toContain('status: needs-info');
    expect(w.claudeCalls.filter((c) => c.role === 'implementer')).toHaveLength(1);
  });
  it('passes --kind to verify-gates', async () => {
    const w = makeWorld();
    await runAgent(w.deps, w.cfg);
    expect(w.runner.calls.filter((c) => c.includes('verify-gates')).some((c) => c.includes('--kind logic'))).toBe(true);
  });
});

describe('review (D27) and UI checks (D30)', () => {
  it('blocker finding -> counted fix, gates run again, minor findings reach the PR body prompt', async () => {
    const w = makeWorld();
    w.script.reviewer = () =>
      reply({
        result: 'blocked',
        reason: 'changes_requested',
        findings: [
          { severity: 'blocker', message: 'AC 2 unmet', file: 'src/a.ts' },
          { severity: 'nit', message: 'rename x' },
        ],
      });
    const out = await runAgent(w.deps, w.cfg);
    expect(out.kind).toBe('pr');
    expect(roles(w)).toEqual(['planner', 'implementer', 'reviewer', 'implementer', 'retro', 'pr-body']);
    expect(w.claudeCalls[3]?.req.prompt).toContain('AC 2 unmet');
    expect(w.claudeCalls[3]?.req.prompt).not.toContain('rename x');
    expect(readState(w.wt('01-demo')).fixAttempts).toBe(1);
    expect(w.runner.calls.filter((c) => c.includes('verify-gates'))).toHaveLength(3); // pre-start, after build, after review fix
    expect(w.claudeCalls[5]?.req.prompt).toContain('rename x');
  });
  it('blocker findings with no fix left -> situation 7', async () => {
    const w = makeWorld();
    w.script.implementer = (req, n) => {
      if (n === 1) updateState(req.cwd, (s) => (s.fixAttempts = 3));
    };
    w.script.reviewer = () => reply({ result: 'blocked', reason: 'changes_requested', findings: [{ severity: 'major', message: 'bug' }] });
    expect(await runAgent(w.deps, w.cfg)).toMatchObject({ situation: 7 });
  });
  it('ui task: dev server runs on the configured port around the UI check and is stopped', async () => {
    const w = makeWorld({ tasks: { '01-demo': TASK_SPEC('').replace('kind: logic', 'kind: ui') } });
    await runAgent(w.deps, w.cfg);
    expect(w.devServer).toMatchObject({ started: [3100], stopped: 1 });
    expect(roles(w)).toEqual(['planner', 'implementer', 'ui', 'reviewer', 'retro', 'pr-body']);
  });
  it('ui check findings of severity major feed the fix loop', async () => {
    const w = makeWorld({ tasks: { '01-demo': TASK_SPEC('').replace('kind: logic', 'kind: ui') } });
    w.script.ui = () => reply({ result: 'ok', reason: 'x', findings: [{ severity: 'major', message: 'overflow on 360px' }] });
    await runAgent(w.deps, w.cfg);
    expect(w.claudeCalls.find((c) => c.role === 'implementer' && c.req.resume)?.req.prompt).toContain('overflow on 360px');
  });
  it('logic task: no dev server', async () => {
    const w = makeWorld();
    await runAgent(w.deps, w.cfg);
    expect(w.devServer.started).toEqual([]);
  });
});

describe('limits and failures (situations 8, 9, 10, 11)', () => {
  it('8: max_turns -> blocked and the turns used are recorded', async () => {
    const w = makeWorld();
    w.script.implementer = () => reply(undefined, { kind: 'max_turns', numTurns: 38, detail: 'max' });
    const out = await runAgent(w.deps, w.cfg);
    expect(out).toMatchObject({ kind: 'stopped', situation: 8 });
    expect(spec(w)).toContain('status: blocked');
    expect(readState(w.wt('01-demo')).turnsUsed).toBe(41);
  });
  it('8: no turns left before a call -> stop without calling claude', async () => {
    const w = makeWorld();
    w.script.planner = (req) => {
      writeFileSync(join(req.env.AGENT_TASK_DIR as string, 'plan.md'), '# plan');
      return reply({ result: 'ok', reason: 'p' }, { numTurns: 39 });
    };
    const out = await runAgent(w.deps, w.cfg);
    expect(out).toMatchObject({ situation: 8 });
    expect(roles(w)).toEqual(['planner']);
  });
  it('9: same tool + target blocked 3 times -> needs-info (checked before interpreting the result)', async () => {
    const w = makeWorld();
    w.script.implementer = (req) => {
      for (let i = 0; i < 3; i++) recordBlock(req.cwd, { tool: 'Edit', target: 'package.json' });
      return reply({ result: 'ok', reason: 'x' });
    };
    const out = await runAgent(w.deps, w.cfg);
    expect(out).toMatchObject({ situation: 9 });
    expect(spec(w)).toContain('status: needs-info');
  });
  it('10: .agent-stop before start -> stop with no notification and no inbox line', async () => {
    const w = makeWorld();
    writeFileSync(join(w.repo, '.agent-stop'), '');
    const out = await runAgent(w.deps, w.cfg);
    expect(out).toMatchObject({ kind: 'stopped', situation: 10 });
    expect(w.notices).toEqual([]);
    expect(w.runner.calls).toEqual([]);
  });
  it('10: .agent-stop created while an agent runs is honoured between steps; task stays resumable', async () => {
    const w = makeWorld();
    w.script.implementer = () => {
      writeFileSync(join(w.repo, '.agent-stop'), '');
      return reply({ result: 'ok', reason: 'x', commit_message: 'feat: x' });
    };
    const out = await runAgent(w.deps, w.cfg);
    expect(out).toMatchObject({ situation: 10 });
    expect(roles(w)).toEqual(['planner', 'implementer']);
    expect(spec(w)).toContain('status: ready-for-agent');
    expect(w.notices).toEqual([]);
  });
  it('11: claude crash / quota -> blocked, worktree kept, human told', async () => {
    const w = makeWorld();
    w.script.implementer = () => reply(undefined, { kind: 'crash', detail: 'usage limit reached' });
    const out = await runAgent(w.deps, w.cfg);
    expect(out).toMatchObject({ situation: 11 });
    expect(existsSync(w.wt('01-demo'))).toBe(true);
    expect(inbox(w)).toContain('| 01-demo | 11 |');
    expect(w.notices).toHaveLength(1);
  });
});

describe('PR creation (situation 12)', () => {
  it('invalid body gets one agent fix (resuming the writer session); then passes', async () => {
    let n = 0;
    const w = makeWorld({
      handlers: [on('bash scripts/check-pr-body.sh', () => (++n === 1 ? { code: 1, stdout: '::error::Missing section: ## 💬 Notes' } : { code: 0 }))],
    });
    w.script['pr-body'] = (_req, i) => reply({ body: i === 1 ? 'bad' : 'good' }, { sessionId: 'pr-1' });
    const out = await runAgent(w.deps, w.cfg);
    expect(out.kind).toBe('pr');
    const calls = w.claudeCalls.filter((c) => c.role === 'pr-body');
    expect(calls).toHaveLength(2);
    expect(calls[1]?.req.resume).toBe('pr-1');
    expect(calls[1]?.req.prompt).toContain('Missing section');
  });
  it('still invalid after the fix -> situation 12, nothing pushed', async () => {
    const w = makeWorld({ handlers: [on('bash scripts/check-pr-body.sh', { code: 1, stdout: '::error::Select exactly one PR Type' })] });
    const out = await runAgent(w.deps, w.cfg);
    expect(out).toMatchObject({ situation: 12 });
    expect(w.runner.calls.some((c) => c.startsWith('git push'))).toBe(false);
    expect(spec(w)).toContain('status: blocked');
  });
  it('a forbidden word in the body fails validation even when the script passes', async () => {
    const w = makeWorld();
    w.script['pr-body'] = () => reply({ body: 'edited .claude/hooks' });
    expect(await runAgent(w.deps, w.cfg)).toMatchObject({ situation: 12 });
  });
  it('push failure -> 12', async () => {
    const w = makeWorld({ handlers: [on('git push', { code: 1, stderr: 'rejected' })] });
    expect(await runAgent(w.deps, w.cfg)).toMatchObject({ situation: 12 });
  });
  it('gh pr create failure -> 12', async () => {
    const w = makeWorld({ handlers: [on('gh pr create', { code: 1, stderr: 'GraphQL error' })] });
    expect(await runAgent(w.deps, w.cfg)).toMatchObject({ situation: 12 });
  });
});

describe('retro (situation 15, D26, D43 exception)', () => {
  it('15: retro out of turns -> one extra uncounted resume asks turns_needed; needs-info; inbox', async () => {
    const w = makeWorld();
    w.script.retro = () => reply(undefined, { kind: 'max_turns', sessionId: 'impl-1', numTurns: 6 });
    const out = await runAgent(w.deps, w.cfg);
    expect(out).toMatchObject({ kind: 'stopped', situation: 15 });
    expect(roles(w).slice(-2)).toEqual(['retro', 'retro-need']);
    expect(w.claudeCalls.at(-1)?.req.resume).toBe('impl-1');
    expect(out.kind === 'stopped' && out.action).toContain('retro task 01-demo cần thêm 4 lượt');
    expect(spec(w)).toContain('status: needs-info');
    expect(inbox(w)).toContain('| 01-demo | 15 |');
    const state = readState(w.wt('01-demo'));
    expect(state.stage).toBe('retro-wait');
    expect(state.turnsUsed).toBe(3 + 3 + 3); // planner + implementer + reviewer; retro not counted
    expect(w.runner.calls.some((c) => c.startsWith('git commit'))).toBe(false);
  });
  it('after retro-turns: resumes the OLD session with X turns, then commits and opens the PR (no re-plan, no re-implement)', async () => {
    const w = makeWorld();
    w.script.retro = (_r, n) =>
      n === 1 ? reply(undefined, { kind: 'max_turns', sessionId: 'impl-1', numTurns: 6 }) : reply(undefined, { sessionId: 'impl-1' });
    await runAgent(w.deps, w.cfg);
    const specFile = join(w.repo, 'docs/plan/tasks/01-demo/spec.md');
    writeFileSync(
      specFile,
      readFileSync(specFile, 'utf8').replace('status: needs-info', 'status: ready-for-agent').replace('---\n\n#', 'retro-turns: 4\n---\n\n#'),
    );
    const before = w.claudeCalls.length;
    const out = await runAgent(w.deps, w.cfg);
    expect(out.kind).toBe('pr');
    const calls = w.claudeCalls.slice(before);
    expect(calls.map((c) => c.role)).toEqual(['retro', 'pr-body']);
    expect(calls[0]?.req).toMatchObject({ resume: 'impl-1', maxTurns: 4 });
    expect(readState(w.wt('01-demo')).resumeCount).toBe(0);
  });
  it('ready-for-agent again without retro-turns -> asks again (15) without calling claude', async () => {
    const w = makeWorld();
    w.script.retro = () => reply(undefined, { kind: 'max_turns', numTurns: 6 });
    await runAgent(w.deps, w.cfg);
    const specFile = join(w.repo, 'docs/plan/tasks/01-demo/spec.md');
    writeFileSync(specFile, readFileSync(specFile, 'utf8').replace('status: needs-info', 'status: ready-for-agent'));
    const before = w.claudeCalls.length;
    expect(await runAgent(w.deps, w.cfg)).toMatchObject({ situation: 15 });
    expect(w.claudeCalls.length).toBe(before);
  });
});

describe('resume (D43)', () => {
  const stopAtImplementer = (w: World) => {
    w.script.implementer = (_req, n) =>
      n === 1 ? reply({ result: 'blocked', reason: 'needs_approval', requested: { paths: ['package.json'], commands: [] } }) : undefined;
  };
  const reready = (w: World, extra = '') => {
    const f = join(w.repo, 'docs/plan/tasks/01-demo/spec.md');
    writeFileSync(
      f,
      readFileSync(f, 'utf8').replace('status: needs-info', 'status: ready-for-agent').replace('kind: logic', `kind: logic\n${extra}`),
    );
  };

  it('runs on the old worktree with a NEW implementer session, fresh 40 turns, resumeCount 1, plan.md kept, new approved list', async () => {
    const w = makeWorld();
    stopAtImplementer(w);
    await runAgent(w.deps, w.cfg);
    reready(w, 'approved:\n  files: [package.json]');
    const before = w.claudeCalls.length;
    const out = await runAgent(w.deps, w.cfg);
    expect(out.kind).toBe('pr');
    const calls = w.claudeCalls.slice(before);
    expect(calls.map((c) => c.role)).toEqual(['implementer', 'reviewer', 'retro', 'pr-body']); // planner skipped: plan.md exists
    expect(calls[0]?.req.resume).toBeUndefined();
    expect(calls[0]?.req.maxTurns).toBe(40);
    expect(calls[0]?.req.prompt).toContain('RESUMING');
    expect(calls[0]?.req.env.AGENT_APPROVED).toBe('{"paths":["package.json"],"commands":[]}');
    expect(readState(w.wt('01-demo')).resumeCount).toBe(1);
    expect(w.runner.calls.filter((c) => c.startsWith('git worktree add'))).toHaveLength(1);
  });
  it('old blocks do not re-trigger situation 9 after approval', async () => {
    const w = makeWorld();
    w.script.implementer = (req, n) => {
      if (n === 1) {
        for (let i = 0; i < 3; i++) recordBlock(req.cwd, { tool: 'Edit', target: 'package.json' });
      }
    };
    expect(await runAgent(w.deps, w.cfg)).toMatchObject({ situation: 9 });
    reready(w, 'approved:\n  files: [package.json]');
    expect((await runAgent(w.deps, w.cfg)).kind).toBe('pr');
  });
  it('a stop on the 2nd resume becomes ready-for-human', async () => {
    const w = makeWorld();
    w.script.implementer = () => reply({ result: 'blocked', reason: 'needs_approval', requested: { paths: ['a'], commands: [] } });
    await runAgent(w.deps, w.cfg); // fresh
    reready(w);
    await runAgent(w.deps, w.cfg); // resume 1
    expect(spec(w)).toContain('status: needs-info');
    reready(w);
    await runAgent(w.deps, w.cfg); // resume 2
    expect(spec(w)).toContain('status: ready-for-human');
    expect(readState(w.wt('01-demo')).resumeCount).toBe(2);
  });
  it('resume after a .agent-stop stop does not count as a resume', async () => {
    const w = makeWorld();
    w.script.implementer = (_req, n) => {
      if (n === 1) writeFileSync(join(w.repo, '.agent-stop'), '');
    };
    expect(await runAgent(w.deps, w.cfg)).toMatchObject({ situation: 10 });
    rmSync(join(w.repo, '.agent-stop'));
    expect((await runAgent(w.deps, w.cfg)).kind).toBe('pr');
    expect(readState(w.wt('01-demo')).resumeCount).toBe(0);
  });
});
