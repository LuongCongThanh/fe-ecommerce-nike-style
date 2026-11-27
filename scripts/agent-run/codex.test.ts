// @vitest-environment node
import { mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { guardConfigSchema, type GuardContext } from '../../.claude/hooks/lib/guard';
import type { ClaudeRequest } from './claude';
import { checkCodexTool } from './codex-guard';
import { codexProvider, parseCodexOutput } from './codex';

const root = process.cwd();
const taskDir = 'docs/storefront/plan/todo/example';
const context: GuardContext = {
  config: guardConfigSchema.parse(JSON.parse(readFileSync('.claude/hooks/lib/guard.fixture.json', 'utf8'))),
  phase: 'plan',
  taskDir,
  projectRoot: root,
  approved: { paths: [], commands: [] },
  agentRun: true,
  stopFileExists: false,
};

const decision = (tool: string, command: string, ctx = context) => checkCodexTool({ tool_name: tool, tool_input: { command }, cwd: root }, ctx);

const patch = (...lines: string[]) => ['*** Begin Patch', ...lines, '*** End Patch'].join('\n');

describe('Codex guard', () => {
  it('allows inspecting the spec and writing only plan.md for the planner', () => {
    expect(decision('Bash', `cat ${taskDir}/spec.md`)).toBeNull();
    expect(decision('apply_patch', patch(`*** Add File: ${taskDir}/plan.md`, '+# Plan'))).toBeNull();
    expect(decision('apply_patch', patch('*** Update File: src/app/page.tsx'))).toMatch(/phase "plan"/);
    expect(decision('Bash', 'cat .env.local')).toMatch(/\.env/);
    expect(decision('Bash', "cat .e''nv.local")).toMatch(/\.env/);
    expect(decision('Bash', 'cat AGENTS.md > plan.md')).toMatch(/read-only/);
  });

  it('blocks aliases and shell patterns that can resolve to paths outside the checkout', () => {
    const scratch = mkdtempSync(join(tmpdir(), 'storefront-guard-'));
    try {
      const checkout = join(scratch, 'checkout');
      const outside = join(scratch, 'outside.txt');
      writeFileSync(outside, 'outside');
      const projectRoot = mkdtempSync(checkout);
      writeFileSync(join(projectRoot, 'safe.txt'), 'inside');
      symlinkSync(outside, join(projectRoot, 'alias.txt'));
      const ctx = { ...context, projectRoot, phase: 'review' };
      const shell = (command: string) => checkCodexTool({ tool_name: 'Bash', tool_input: { command }, cwd: projectRoot }, ctx);
      expect(shell('cat safe.txt')).toBeNull();
      expect(shell('cat alias.txt')).toMatch(/read-only/);
      expect(shell('cat alia?.txt')).toMatch(/read-only/);
    } finally {
      rmSync(scratch, { recursive: true, force: true });
    }
  });

  it('checks all patch paths, including rename destinations, before approving a tool call', () => {
    const implement = { ...context, phase: 'implement' };
    expect(decision('apply_patch', patch('*** Update File: src/app/page.tsx', '*** Move to: pnpm-lock.yaml'), implement)).toMatch(/protected/);
    expect(decision('apply_patch', patch('*** Add File: ../other.md', '+text'), implement)).toMatch(/outside/);
    expect(decision('Bash', 'git add -A', implement)).toMatch(/outside/);
    expect(decision('Bash', 'pnpm typecheck', implement)).toBeNull();
    expect(decision('Bash', 'pwd', { ...implement, stopFileExists: true })).toMatch(/Emergency stop/);
  });
});

const request: ClaudeRequest = { cwd: root, phase: 'review', env: {}, prompt: 'Review', maxTurns: 5, schema: {} };
const transcript = [
  { type: 'thread.started', thread_id: 'test-thread' },
  { type: 'item.completed', item: { type: 'agent_message', text: '{"result":"ok"}' } },
  { type: 'turn.completed', usage: { input_tokens: 15, cached_input_tokens: 5, output_tokens: 8 } },
]
  .map((event) => JSON.stringify(event))
  .join('\n');

describe('Codex provider', () => {
  it('reads the final JSON, session and usage, and stops when the guarded tool budget is exhausted', () => {
    expect(parseCodexOutput(transcript, '', 0, 2, request)).toMatchObject({
      kind: 'ok',
      sessionId: 'test-thread',
      numTurns: 3,
      structured: { result: 'ok' },
      usage: { input: 15, cached: 5, output: 8 },
    });
    expect(parseCodexOutput(transcript, '', 0, 5, request).kind).toBe('max_turns');
  });

  it('resumes the recorded Codex thread without asking Codex to create a worktree', async () => {
    const provider = codexProvider(async (cmd, args) => {
      expect(cmd).toBe('codex');
      expect(args).toContain('resume');
      expect(args).toContain('test-thread');
      expect(args).not.toContain('--worktree');
      return { stdout: transcript, stderr: '', code: 0 };
    }, resolve(root));
    expect(await provider.run({ ...request, resume: 'test-thread' })).toMatchObject({ kind: 'ok' });
  });

  it('rejects a successful CLI exit when the guard did not actually run', async () => {
    const provider = codexProvider(async () => ({ stdout: transcript, stderr: '', code: 0 }), root);
    await expect(provider.preflight(root, taskDir)).rejects.toThrow('0 hook calls');
  });
});
