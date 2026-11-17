// @vitest-environment node
import { describe, expect, it } from 'vitest';

import { allowedToolsFor, buildClaudeArgs, parseClaudeOutput, type ClaudeRequest } from './claude';

const base: ClaudeRequest = { cwd: '/wt', prompt: 'do it', maxTurns: 12, env: {}, phase: 'implement' };

const none = { allowCommands: [], readCommands: [], outputFilters: [] };

describe('buildClaudeArgs', () => {
  it('puts the prompt right after -p (variadic flags must not swallow it)', () => {
    const a = buildClaudeArgs({ ...base, agent: 'implementer' }, { ...none, allowCommands: ['pnpm test'] });
    expect(a.slice(0, 2)).toEqual(['-p', 'do it']);
    expect(a).toEqual(expect.arrayContaining(['--output-format', 'json', '--max-turns', '12', '--agent', 'implementer']));
    expect(a[a.indexOf('--allowedTools') + 1]).toContain('Bash(pnpm test)');
  });
  it('adds --resume and --json-schema when asked', () => {
    const a = buildClaudeArgs({ ...base, resume: 'abc', schema: { type: 'object' } }, none);
    expect(a[a.indexOf('--resume') + 1]).toBe('abc');
    expect(a[a.indexOf('--json-schema') + 1]).toBe('{"type":"object"}');
  });
  it('never asks for permission prompts (unattended)', () => {
    const a = buildClaudeArgs(base, none);
    expect(a[a.indexOf('--permission-prompts') + 1]).toBe('none');
  });
});

describe('allowedToolsFor', () => {
  const guard = { allowCommands: ['pnpm test', 'pnpm exec vitest run *'], readCommands: ['cat *', 'git diff *'], outputFilters: ['tail', 'grep'] };
  const reads = ['Bash(cat *)', 'Bash(git diff *)', 'Bash(tail *)', 'Bash(grep *)'];
  it('implementer/retro: edit tools + each allowed command + read commands and output filters', () => {
    for (const phase of ['implement', 'retro'] as const) {
      const t = allowedToolsFor(phase, guard);
      expect(t).toEqual(expect.arrayContaining(['Read', 'Edit', 'Write', 'Bash(pnpm test)', 'Bash(pnpm exec vitest run *)', ...reads]));
    }
  });
  it('planner: no Bash; reviewer: read commands and filters only, no pnpm', () => {
    expect(allowedToolsFor('plan', guard).some((x) => x.startsWith('Bash'))).toBe(false);
    expect(allowedToolsFor('review', guard).filter((x) => x.startsWith('Bash'))).toEqual(reads);
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
  it('schema requested, structured_output missing, result holds the JSON object (seen with --agent) -> ok', () => {
    const result = '{"result":"ok","reason":"plan.md written"}';
    const r = parseClaudeOutput(json({ subtype: 'success', is_error: false, result }), '', 0, true);
    expect(r).toMatchObject({ kind: 'ok', structured: { result: 'ok', reason: 'plan.md written' } });
  });
  it('schema requested, result is JSON inside a ```json fence -> ok', () => {
    const result = 'Done.\n```json\n{"result":"need_info","reason":"x"}\n```';
    expect(parseClaudeOutput(json({ subtype: 'success', is_error: false, result }), '', 0, true).structured).toEqual({
      result: 'need_info',
      reason: 'x',
    });
  });
  it('schema requested, prose then a bare JSON object (reviewer, task 05) -> ok', () => {
    const result =
      'I checked the change. Writing up the result now.\n\n{"result":"ok","reason":"r","findings":[{"severity":"nit","message":"uses {braces}"}]}';
    expect(parseClaudeOutput(json({ subtype: 'success', is_error: false, result }), '', 0, true).structured).toEqual({
      result: 'ok',
      reason: 'r',
      findings: [{ severity: 'nit', message: 'uses {braces}' }],
    });
  });
  it('schema requested, result is prose or a JSON array -> bad_output', () => {
    expect(parseClaudeOutput(json({ subtype: 'success', is_error: false, result: 'all done' }), '', 0, true).kind).toBe('bad_output');
    expect(parseClaudeOutput(json({ subtype: 'success', is_error: false, result: '[1]' }), '', 0, true).kind).toBe('bad_output');
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
  it('JSON that is not an object (null, array, number) is a crash, not a TypeError', () => {
    for (const out of ['null', '[]', '3', '"x"']) expect(parseClaudeOutput(out, '', 0, false).kind).toBe('crash');
  });
  it('ignores fields with the wrong type instead of trusting them', () => {
    const r = parseClaudeOutput(json({ subtype: 'success', is_error: false, num_turns: 'many', session_id: 7, total_cost_usd: null }), '', 0, false);
    expect(r).toMatchObject({ kind: 'ok', numTurns: 0, sessionId: null, costUsd: 0 });
  });
  it('result string for quota messages even when is_error is set', () => {
    const r = parseClaudeOutput(json({ subtype: 'success', is_error: true, result: 'Claude AI usage limit reached' }), '', 1, false);
    expect(r.kind).toBe('crash');
    expect(r.detail).toContain('usage limit');
  });
});
