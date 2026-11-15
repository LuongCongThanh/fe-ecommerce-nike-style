// @vitest-environment node
import { describe, expect, it } from 'vitest';

import { allowedToolsFor, buildClaudeArgs, parseClaudeOutput, type ClaudeRequest } from './claude';

const base: ClaudeRequest = { cwd: '/wt', prompt: 'do it', maxTurns: 12, env: {}, phase: 'implement' };

describe('buildClaudeArgs', () => {
  it('puts the prompt right after -p (variadic flags must not swallow it)', () => {
    const a = buildClaudeArgs({ ...base, agent: 'implementer' }, ['pnpm test']);
    expect(a.slice(0, 2)).toEqual(['-p', 'do it']);
    expect(a).toEqual(expect.arrayContaining(['--output-format', 'json', '--max-turns', '12', '--agent', 'implementer']));
    expect(a[a.indexOf('--allowedTools') + 1]).toContain('Bash(pnpm test)');
  });
  it('adds --resume and --json-schema when asked', () => {
    const a = buildClaudeArgs({ ...base, resume: 'abc', schema: { type: 'object' } }, []);
    expect(a[a.indexOf('--resume') + 1]).toBe('abc');
    expect(a[a.indexOf('--json-schema') + 1]).toBe('{"type":"object"}');
  });
  it('never asks for permission prompts (unattended)', () => {
    const a = buildClaudeArgs(base, []);
    expect(a[a.indexOf('--permission-prompts') + 1]).toBe('none');
  });
});

describe('allowedToolsFor', () => {
  const guard = ['pnpm test', 'pnpm exec vitest run *'];
  it('implementer/retro: edit tools + each allowed command', () => {
    for (const phase of ['implement', 'retro'] as const) {
      const t = allowedToolsFor(phase, guard);
      expect(t).toEqual(expect.arrayContaining(['Read', 'Edit', 'Write', 'Bash(pnpm test)', 'Bash(pnpm exec vitest run *)']));
    }
  });
  it('planner: no Bash; reviewer: only git diff/log', () => {
    expect(allowedToolsFor('plan', guard).some((x) => x.startsWith('Bash'))).toBe(false);
    expect(allowedToolsFor('review', guard).filter((x) => x.startsWith('Bash'))).toEqual(['Bash(git diff *)', 'Bash(git log *)']);
    expect(allowedToolsFor('review', guard)).not.toContain('Edit');
  });
});

describe('parseClaudeOutput', () => {
  const json = (o: object) => JSON.stringify({ type: 'result', session_id: 's1', num_turns: 4, total_cost_usd: 0.3, ...o });
  it('success with structured_output', () => {
    const r = parseClaudeOutput(json({ subtype: 'success', is_error: false, structured_output: { result: 'ok' } }), '', 0, true);
    expect(r).toMatchObject({ kind: 'ok', sessionId: 's1', numTurns: 4, structured: { result: 'ok' } });
  });
  it('success without schema needs no structured_output', () => {
    expect(parseClaudeOutput(json({ subtype: 'success', is_error: false, result: 'x' }), '', 0, false).kind).toBe('ok');
  });
  it('schema requested but missing -> bad_output', () => {
    expect(parseClaudeOutput(json({ subtype: 'success', is_error: false }), '', 0, true).kind).toBe('bad_output');
  });
  it('error_max_turns -> max_turns (situation 8)', () => {
    const r = parseClaudeOutput(json({ subtype: 'error_max_turns', is_error: true, num_turns: 41 }), '', 1, true);
    expect(r).toMatchObject({ kind: 'max_turns', numTurns: 41 });
  });
  it('other is_error -> crash (situation 11) with detail', () => {
    const r = parseClaudeOutput(json({ subtype: 'error_during_execution', is_error: true, errors: ['usage limit reached'] }), '', 1, true);
    expect(r.kind).toBe('crash');
    expect(r.detail).toContain('usage limit reached');
  });
  it('non JSON stdout / empty -> crash with stderr', () => {
    const r = parseClaudeOutput('', 'ECONNRESET', 1, false);
    expect(r.kind).toBe('crash');
    expect(r.detail).toContain('ECONNRESET');
    expect(parseClaudeOutput('not json', '', 0, false).kind).toBe('crash');
  });
  it('result string for quota messages even when is_error is set', () => {
    const r = parseClaudeOutput(json({ subtype: 'success', is_error: true, result: 'Claude AI usage limit reached' }), '', 1, false);
    expect(r.kind).toBe('crash');
    expect(r.detail).toContain('usage limit');
  });
});
