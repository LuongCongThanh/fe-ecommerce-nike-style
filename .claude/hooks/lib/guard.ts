/**
 * Pure decision logic for agent-guard (no IO). See .claude/agent-guard.json and
 * docs/plan/README.md ("Agent guard") for the contract.
 */
import { isAbsolute, posix, relative, resolve, sep } from 'node:path';

import { z } from 'zod';

import { matchCommand, matchesGlob, parseCommand } from './shell';

const phaseConfigSchema = z.object({
  /** Only these paths are writable in this phase (overrides everything). `{taskDir}` is expanded. */
  writeOnly: z.array(z.string()).optional(),
  /** Extra writable paths that override denyPaths/askPaths. `{taskDir}` is expanded. */
  writeAlso: z.array(z.string()).optional(),
  /** Replaces the top-level allowCommands in this phase. */
  allowCommands: z.array(z.string()).optional(),
});

/** Shape of .claude/agent-guard.json; the file is parsed with this at every boundary that reads it. */
export const guardConfigSchema = z.object({
  stopFile: z.string(),
  secretFiles: z.object({ deny: z.array(z.string()), allow: z.array(z.string()) }),
  allowCommands: z.array(z.string()),
  denyCommandPatterns: z.array(z.string()),
  denyPaths: z.array(z.string()),
  askPaths: z.array(z.string()),
  phases: z.record(z.string(), phaseConfigSchema),
});

export type PhaseConfig = z.infer<typeof phaseConfigSchema>;
export type GuardConfig = z.infer<typeof guardConfigSchema>;

export interface Approved {
  paths: string[];
  commands: string[];
}

export interface GuardContext {
  config: GuardConfig;
  /** AGENT_RUN=1 */
  agentRun: boolean;
  /** AGENT_PHASE; unset means "implement" */
  phase?: string | undefined;
  /** AGENT_TASK_DIR, relative to projectRoot or absolute */
  taskDir?: string | undefined;
  approved: Approved;
  /** Root of the (work)tree the agent runs in */
  projectRoot: string;
  /** Does `<main repo root>/.agent-stop` exist? Only consulted when agentRun */
  stopFileExists: boolean;
}

/** The PreToolUse event Claude Code writes to stdin. */
export const hookInputSchema = z.object({
  tool_name: z.string(),
  tool_input: z.record(z.string(), z.unknown()).default({}),
  cwd: z.string().optional(),
});

export type HookInput = z.infer<typeof hookInputSchema>;

export type DenyKind = 'secret' | 'stop-file' | 'emergency-stop' | 'deny-path' | 'ask-path' | 'outside-root' | 'phase' | 'command' | 'bad-input';

export type Decision = { allow: true } | { allow: false; kind: DenyKind; reason: string; target: string };

const WRITE_TOOLS = new Set(['Edit', 'Write', 'MultiEdit', 'NotebookEdit']);
const NEEDS_APPROVAL =
  'Do not retry or work around it. If this is required, finish what you can and return result=blocked with reason=needs_approval naming it.';

const allow: Decision = { allow: true };
const deny = (kind: DenyKind, target: string, reason: string): Decision => ({ allow: false, kind, target, reason });

function nonEmptyString(v: unknown): string | undefined {
  return typeof v === 'string' && v.length > 0 ? v : undefined;
}

function toRelative(root: string, cwd: string, p: string): string | null {
  const abs = resolve(isAbsolute(cwd) ? cwd : root, p);
  const rel = relative(root, abs);
  if (rel === '..' || rel.startsWith(`..${sep}`) || isAbsolute(rel)) return null;
  return rel.split(sep).join('/');
}

function isSecretName(name: string, config: GuardConfig): boolean {
  if (matchesGlob(name, config.secretFiles.allow)) return false;
  return matchesGlob(name, config.secretFiles.deny);
}

/** Does free text (a Bash command, a Glob pattern) mention a secret env file? Best-effort string scan. */
function mentionsSecret(text: string, config: GuardConfig): boolean {
  for (const m of text.matchAll(/(?<![\w.-])\.env[\w.*?-]*/g)) {
    const token = m[0].replace(/\.+$/, '');
    if (!/^\.env($|[.*?])/.test(token)) continue;
    if (matchesGlob(token, config.secretFiles.allow)) continue;
    return true;
  }
  return false;
}

function mentionsStopFile(text: string, config: GuardConfig): boolean {
  return text.includes(config.stopFile);
}

function expand(patterns: string[] | undefined, taskDir: string | null): string[] {
  if (!patterns) return [];
  const out: string[] = [];
  for (const p of patterns) {
    if (p.includes('{taskDir}')) {
      if (taskDir) out.push(p.replace('{taskDir}', taskDir));
    } else out.push(p);
  }
  return out;
}

function normalizeTaskDir(ctx: GuardContext): string | null {
  if (!ctx.taskDir) return null;
  const rel = toRelative(ctx.projectRoot, ctx.projectRoot, ctx.taskDir);
  return rel && rel !== '' ? posix.normalize(rel) : null;
}

/** Always-on checks: secrets and the stop file, for every tool. */
function alwaysOn(input: HookInput, config: GuardConfig, root: string): Decision | null {
  const toolInput = input.tool_input;
  const cwd = input.cwd ?? root;
  const paths = [
    nonEmptyString(toolInput.file_path),
    nonEmptyString(toolInput.notebook_path),
    input.tool_name === 'Grep' ? nonEmptyString(toolInput.path) : undefined,
  ];
  if (input.tool_name === 'Glob') paths.push(nonEmptyString(toolInput.path));
  for (const p of paths) {
    if (!p) continue;
    const abs = resolve(isAbsolute(cwd) ? cwd : root, p);
    const name = posix.basename(abs.split(sep).join('/'));
    if (isSecretName(name, config)) {
      return deny('secret', p, `${name} holds secrets and is never readable or writable by agents. Use .env.example for variable names.`);
    }
    if (name === config.stopFile) return deny('stop-file', p, `${config.stopFile} is the emergency stop file; do not touch it.`);
  }
  const texts: string[] = [];
  if (input.tool_name === 'Bash') texts.push(nonEmptyString(toolInput.command) ?? '');
  if (input.tool_name === 'Glob') texts.push(nonEmptyString(toolInput.pattern) ?? '');
  if (input.tool_name === 'Grep') texts.push(nonEmptyString(toolInput.glob) ?? '');
  for (const t of texts) {
    if (mentionsSecret(t, config)) return deny('secret', t, 'Reading or writing .env* files (except .env.example) is blocked for agents.');
    if (mentionsStopFile(t, config)) return deny('stop-file', t, `${config.stopFile} is the emergency stop file; do not touch it.`);
  }
  return null;
}

function decideWrite(rel: string | null, raw: string, ctx: GuardContext): Decision {
  const config = ctx.config;
  if (rel === null) return deny('outside-root', raw, `Writing outside the worktree (${raw}) is not allowed.`);
  const phase = ctx.phase ?? 'implement';
  const phaseConfig = config.phases[phase] ?? {};
  const taskDir = normalizeTaskDir(ctx);

  if (phaseConfig.writeOnly) {
    if (matchesGlob(rel, expand(phaseConfig.writeOnly, taskDir))) return allow;
    const where = phaseConfig.writeOnly.length ? `only ${expand(phaseConfig.writeOnly, taskDir).join(', ') || '(task dir unknown)'}` : 'nothing';
    return deny('phase', rel, `In phase "${phase}" you may write ${where}; ${rel} is outside that. ${NEEDS_APPROVAL}`);
  }
  if (matchesGlob(rel, expand(phaseConfig.writeAlso, taskDir))) return allow;
  if (matchesGlob(rel, ctx.approved.paths)) return allow;
  if (matchesGlob(rel, config.denyPaths)) {
    return deny('deny-path', rel, `${rel} is protected (agent-guard denyPaths) and cannot be changed by agents. ${NEEDS_APPROVAL}`);
  }
  if (matchesGlob(rel, config.askPaths)) {
    return deny('ask-path', rel, `${rel} needs human approval before an agent may change it. ${NEEDS_APPROVAL}`);
  }
  return allow;
}

function decideBash(command: string, ctx: GuardContext): Decision {
  const config = ctx.config;
  const phase = ctx.phase ?? 'implement';
  const phaseConfig = config.phases[phase] ?? {};
  const allowList = phaseConfig.allowCommands ?? config.allowCommands;
  const notAllowed = (what: string) => deny('command', command, `${what} is not in the allowed command list for this run. ${NEEDS_APPROVAL}`);

  for (const re of config.denyCommandPatterns) {
    if (new RegExp(re).test(command)) return notAllowed('This command (destructive pattern)');
  }
  const parsed = parseCommand(command);
  if (!parsed.ok) return notAllowed(`This command (${parsed.reason})`);

  for (const seg of parsed.segments) {
    for (const r of seg.redirects) {
      if (r.target === '/dev/null') continue;
      if (/[$*?[~]/.test(r.target)) return notAllowed(`Redirect target "${r.target}" (not statically known)`);
      if (r.op.startsWith('<')) continue; // reads: secrets already handled
      const d = decideWrite(toRelative(ctx.projectRoot, ctx.projectRoot, r.target), r.target, ctx);
      if (!d.allow) return { ...d, target: command };
    }
    if (seg.words.length === 0) continue;
    const ok = [...allowList, ...ctx.approved.commands].some((p) => matchCommand(seg.words, p));
    if (!ok) return notAllowed(`"${seg.words.join(' ')}"`);
  }
  return allow;
}

export function decide(input: HookInput, ctx: GuardContext): Decision {
  const config = ctx.config;
  const root = ctx.projectRoot;
  const tool = input.tool_name;
  const toolInput = input.tool_input ?? {};

  if (ctx.agentRun && ctx.stopFileExists) {
    return deny('emergency-stop', config.stopFile, `${config.stopFile} exists: emergency stop. Stop all work now and return result=blocked.`);
  }
  const always = alwaysOn(input, config, root);
  if (always) return always;
  if (!ctx.agentRun) return allow;

  const phase = ctx.phase ?? 'implement';
  if (!config.phases[phase]) return deny('phase', phase, `Unknown AGENT_PHASE "${phase}".`);

  if (WRITE_TOOLS.has(tool)) {
    const p = nonEmptyString(toolInput.file_path) ?? nonEmptyString(toolInput.notebook_path);
    if (!p) return deny('bad-input', tool, `${tool} call without a file path.`);
    return decideWrite(toRelative(root, input.cwd ?? root, p), p, ctx);
  }
  if (tool === 'Bash') {
    const command = nonEmptyString(toolInput.command);
    if (!command) return deny('bad-input', 'Bash', 'Bash call without a command.');
    return decideBash(command, ctx);
  }
  return allow;
}
