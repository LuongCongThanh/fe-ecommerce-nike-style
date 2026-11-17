import { appendFileSync, existsSync, readFileSync, realpathSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

import { parseApproved } from '../../.claude/hooks/agent-guard';
import { decide, guardConfigSchema, hookInputSchema, type GuardContext, type HookInput } from '../../.claude/hooks/lib/guard';
import { parseCommand } from '../../.claude/hooks/lib/shell';
import { recordBlock } from './state';

const READ_OPTIONS = new Set(['-n', '-l', '-a', '-la', '-al', '-i', '-F', '-S', '--files', '--oneline', '--stat', '--name-only', '--short']);
const BROWSER_TOOLS = new Set(['navigate', 'snapshot', 'click', 'press_key', 'resize', 'console_messages', 'close']);
const PATCH_HEADER = /^\*\*\* (?:Add File|Update File|Delete File|Move to): (.+)$/gm;

function isReadOnly(command: string, root: string): boolean {
  const parsed = parseCommand(command);
  if (!parsed.ok || parsed.segments.length !== 1) return false;
  const [segment] = parsed.segments;
  if (!segment || segment.redirects.length) return false;
  const [tool, ...args] = segment.words;
  if (tool === 'pwd') return args.length === 0;
  if (tool === 'git' && !['diff', 'log', 'status', 'show'].includes(args.shift() ?? '')) return false;
  if (!['git', 'cat', 'ls', 'rg', 'sed'].includes(tool ?? '')) return false;
  if (tool === 'sed' && (args.shift() !== '-n' || !/^\d+(?:,\d+)?p$/.test(args.shift() ?? ''))) return false;
  return args.every((arg) => {
    if (READ_OPTIONS.has(arg)) return true;
    if (arg.startsWith('-') || /(^\/|(?:^|\/)\.\.(?:\/|$)|[$*`~?{}\[\]])/u.test(arg)) return false;
    try {
      checkedPath(root, arg);
      return true;
    } catch {
      return false;
    }
  });
}

function checkedPath(root: string, path: string): string {
  const absolute = resolve(root, path);
  let parent = absolute;
  while (!existsSync(parent)) parent = dirname(parent);
  if (realpathSync(parent) !== parent) throw new Error(`Path uses a symbolic link: ${path}`);
  return absolute;
}

export function checkCodexTool(input: HookInput, ctx: GuardContext, browserUrl?: string): string | null {
  const name = input.tool_name;
  const command = input.tool_input.command;
  if (input.cwd && resolve(input.cwd) !== ctx.projectRoot) return 'Use the task checkout as the working directory.';
  if (ctx.stopFileExists) return 'Emergency stop is active.';
  if (name === 'apply_patch') {
    if (typeof command !== 'string' || !command.startsWith('*** Begin Patch\n')) return 'Missing patch text.';
    const paths = [...command.matchAll(PATCH_HEADER)].map((match) => match[1]?.trim() ?? '');
    if (!paths.length) return 'Missing patch file paths.';
    for (const path of paths) {
      const file = checkedPath(ctx.projectRoot, path);
      const gitDir = resolve(ctx.projectRoot, '.git');
      if (file === gitDir || file.startsWith(gitDir + '/')) return 'Git metadata is protected.';
      const denied = decide({ tool_name: 'Edit', tool_input: { file_path: file } }, ctx);
      if (!denied.allow) return denied.reason;
    }
    return null;
  }
  if (name === 'Bash' && typeof command === 'string') {
    if (isReadOnly(command, ctx.projectRoot)) {
      const checked = decide(input, { ...ctx, agentRun: false });
      return checked.allow ? null : checked.reason;
    }
    if (ctx.phase !== 'implement') return 'Only read-only shell commands are available in this phase.';
    // Git mutations belong to the runner, even when a task approves other shell commands.
    const parsed = parseCommand(command);
    if (!parsed.ok || parsed.segments.some((segment) => segment.redirects.length > 0 || segment.words[0] === 'git'))
      return 'Shell command is outside the task policy.';
    const checked = decide(input, ctx);
    return checked.allow ? null : checked.reason;
  }
  if (browserUrl && name.startsWith('mcp__playwright__browser_') && BROWSER_TOOLS.has(name.slice('mcp__playwright__browser_'.length))) {
    if (name.endsWith('_navigate') && input.tool_input.url !== browserUrl) return 'Navigate to the local task preview URL.';
    return null;
  }
  return 'Tool is outside the unattended task policy.';
}

function main(): number {
  if (process.env.AGENT_RUN !== '1' || !process.env.AGENT_CODEX_ROOT) return 0;
  try {
    const {
      AGENT_CODEX_ROOT: root,
      AGENT_CODEX_LEDGER: ledger,
      AGENT_CODEX_POLICY: policy,
      AGENT_CODEX_STOP: stop,
      AGENT_CODEX_LIMIT: limit,
    } = process.env;
    if (!root || !ledger || !policy || !stop || !limit) throw new Error('Missing task guard environment.');
    const maxCalls = Number(limit);
    if (!Number.isSafeInteger(maxCalls) || maxCalls < 1) throw new Error('Invalid tool-call budget.');
    const input = hookInputSchema.parse(JSON.parse(readFileSync(0, 'utf8')));
    // Append first so simultaneous hook invocations cannot both claim the same last slot.
    appendFileSync(ledger, '+\n');
    const count = readFileSync(ledger, 'utf8').split('\n').length - 1;
    if (count >= maxCalls) throw new Error('Tool-call budget exhausted. Return your final answer now.');
    const reason = checkCodexTool(
      input,
      {
        config: guardConfigSchema.parse(JSON.parse(readFileSync(policy, 'utf8'))),
        agentRun: true,
        phase: process.env.AGENT_PHASE,
        taskDir: process.env.AGENT_TASK_DIR,
        approved: parseApproved(process.env.AGENT_APPROVED),
        projectRoot: root,
        stopFileExists: existsSync(stop),
      },
      process.env.AGENT_CODEX_BROWSER,
    );
    if (!reason) return 0;
    if (process.env.AGENT_CODEX_PROBE !== '1')
      recordBlock(root, {
        tool: input.tool_name,
        target:
          input.tool_name === 'apply_patch'
            ? [...String(input.tool_input.command).matchAll(PATCH_HEADER)].map((match) => match[1]).join(', ')
            : String(input.tool_input.command ?? input.tool_name),
      });
    process.stderr.write(`agent-guard: ${reason}\n`);
  } catch (error) {
    process.stderr.write(`agent-guard: ${error instanceof Error ? error.message : String(error)}\n`);
  }
  return 2;
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(import.meta.filename)) process.exit(main());
