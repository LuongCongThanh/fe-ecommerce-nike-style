/**
 * Pure decision logic for agent-guard (no IO). See .claude/agent-guard.json and
 * docs/agents/runner.md ("Guard contract") for the contract.
 */
import { lstatSync } from 'node:fs';
import { isAbsolute, posix, relative, resolve, sep } from 'node:path';

import { z } from 'zod';

import { matchCommand, matchesGlob, parseCommand, type Segment } from './shell';

const phaseConfigSchema = z.object({
  /** Only these paths are writable in this phase (overrides everything). `{taskDir}` is expanded. */
  writeOnly: z.array(z.string()).optional(),
  /** Extra writable paths that override denyPaths/askPaths. `{taskDir}` is expanded. */
  writeAlso: z.array(z.string()).optional(),
  /** Replaces the top-level allowCommands in this phase. */
  allowCommands: z.array(z.string()).optional(),
  /** Replaces the top-level readCommands in this phase (`[]` = none, e.g. the planner). */
  readCommands: z.array(z.string()).optional(),
});

/** Shape of .claude/agent-guard.json; the file is parsed with this at every boundary that reads it. */
export const guardConfigSchema = z.object({
  stopFile: z.string(),
  secretFiles: z.object({ deny: z.array(z.string()), allow: z.array(z.string()) }),
  allowCommands: z.array(z.string()),
  /** Read-only commands (cat, ls, git diff, ...): allowed with path checks (inside the worktree, no globs/vars). `cd <dir>` is accepted too. */
  readCommands: z.array(z.string()).default([]),
  /** Output filters (tail, head, grep, wc) accepted after `|` when everything before them is allowed. */
  outputFilters: z.array(z.string()).default([]),
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

const RUN_ALONE =
  'So run the allowed command on its own (e.g. `{example}`): no extra pipes, redirects or chained commands. Do not give up on the whole task because of this denial; only the denied part would need approval.';

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
  if (input.tool_name === 'Bash') {
    const command = nonEmptyString(toolInput.command) ?? '';
    texts.push(command);
    const parsed = parseCommand(command);
    if (parsed.ok) for (const segment of parsed.segments) texts.push(...segment.words, ...segment.redirects.map((r) => r.target));
  }
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

const FILTER_TAIL_HEAD = [/^-n$/, /^-n\d+$/, /^-\d+$/];
const GREP_FLAGS = /^-[ivEFwxnc]+$/;
const GREP_NUM_FLAGS = new Set(['-A', '-B', '-C', '-m']);

/** `tail|head [-n N|-nN|-N]`, `grep [flags] <pattern>` (no files, no -r/-f), `wc -l`: the output filters an agent may append to an allowed command. */
function isOutputFilter(words: readonly string[], names: readonly string[]): boolean {
  const [name, ...args] = words;
  if (name === undefined || !names.includes(name) || args.some((arg) => /[$*`?{}\[\]~]/.test(arg))) return false;
  if (name === 'tail' || name === 'head') {
    if (args.length === 0) return true;
    const [a, b] = args;
    if (args.length === 1) return a !== undefined && FILTER_TAIL_HEAD.slice(1).some((re) => re.test(a));
    return args.length === 2 && a === '-n' && b !== undefined && /^\d+$/.test(b);
  }
  if (name === 'wc') return args.length === 1 && args[0] === '-l';
  if (name === 'grep') {
    let patterns = 0;
    for (let i = 0; i < args.length; i++) {
      const a = args.at(i) ?? '';
      if (GREP_NUM_FLAGS.has(a)) {
        if (!/^\d+$/.test(args.at(i + 1) ?? '')) return false;
        i++;
      } else if (a.startsWith('-')) {
        if (!GREP_FLAGS.test(a)) return false;
      } else patterns++;
    }
    return patterns === 1;
  }
  return false;
}

/** Check raw components before resolving "..", which could otherwise hide an alias in a prefix. */
function isSafeShellPath(root: string, cwd: string, operand: string): boolean {
  const base = resolve(root, cwd);
  if (toRelative(root, base, operand) === null) return false;
  let path = base;
  let components = operand;
  if (isAbsolute(operand)) {
    path = root;
    if (operand === root) return true;
    if (!operand.startsWith(root + sep)) return false;
    components = operand.slice(root.length + 1);
  }
  for (const part of components.split(sep)) {
    path = resolve(path, part);
    if (toRelative(root, root, path) === null) return false;
    try {
      if (lstatSync(path).isSymbolicLink()) return false;
    } catch (error) {
      if (typeof error !== 'object' || !error || !('code' in error) || !['ENOENT', 'ENOTDIR'].includes(String(error.code))) throw error;
    }
  }
  return true;
}

type ReadCheck = { ok: true; cwd: string } | { ok: false; what: string };

/** Path/redirect checks for a read-only command; `cwd` (relative to the worktree) follows `cd`. */
function checkReadCommand(seg: Segment, ctx: GuardContext, cwd: string): ReadCheck {
  const [name = '', ...rest] = seg.words;
  const bad = (what: string): ReadCheck => ({ ok: false, what });
  if (seg.redirects.some((r) => !r.op.startsWith('<') && r.target !== '/dev/null'))
    return bad(`"${seg.words.join(' ')}" (read-only commands may not redirect output)`);
  if (name === 'cd' && seg.redirects.length) return bad('cd does not accept redirects');
  if (name === 'echo') return { ok: true, cwd };
  const isGit = name === 'git';
  const args = isGit ? rest.slice(1) : rest;
  if (isGit && args.some((arg) => /^--(?:no-index|ext-diff|textconv)(?:=|$)/.test(arg)))
    return bad('Git option may read external files or execute another command');
  const base = resolve(ctx.projectRoot, cwd);
  const operands: string[] = [];
  for (const a of args) {
    if (a.startsWith('-') && a !== '-') {
      if (name === 'cd') return bad('"cd" with options');
      continue;
    }
    if (a.includes('$') || a.startsWith('~')) return bad(`Argument "${a}" (not statically known)`);
    if (/[*?{}\[\]]/.test(a)) return bad(`Argument "${a}" (globs are not allowed here)`);
    if (toRelative(ctx.projectRoot, base, a) === null) return bad(`Path "${a}" (outside the checkout)`);
    if (!isSafeShellPath(ctx.projectRoot, cwd, a)) return bad(`Path "${a}" uses a symbolic link`);
    operands.push(a);
  }
  if (name === 'cd') {
    const [target] = operands;
    if (operands.length !== 1 || target === undefined) return bad('"cd" without exactly one directory');
    return { ok: true, cwd: toRelative(ctx.projectRoot, base, target) ?? cwd };
  }
  return { ok: true, cwd };
}

const matchesAny = (words: readonly string[], patterns: readonly string[]) => patterns.some((p) => matchCommand(words, p));
const isVerification = (words: readonly string[]) => words[0] !== 'echo' && words[0] !== 'cd';

function decideBash(command: string, ctx: GuardContext, cwd: string): Decision {
  const config = ctx.config;
  const phase = ctx.phase ?? 'implement';
  const phaseConfig = config.phases[phase] ?? {};
  const allowList = [...(phaseConfig.allowCommands ?? config.allowCommands), ...ctx.approved.commands];
  const readList = phaseConfig.readCommands ?? config.readCommands;
  const filterNames = config.outputFilters;

  /** First allowed command on the line, shown to the agent as the thing to run on its own. */
  const allowedExample = (segments: readonly Segment[]): string | null => {
    for (const seg of segments) {
      if (seg.words.length === 0) continue;
      const safeRead = matchesAny(seg.words, readList) && isVerification(seg.words) && checkReadCommand({ ...seg, redirects: [] }, ctx, '').ok;
      if (matchesAny(seg.words, allowList) || safeRead) return seg.words.join(' ');
    }
    return null;
  };
  const notAllowed = (what: string, segments?: readonly Segment[]): Decision => {
    let segs = segments;
    if (!segs) {
      const p = parseCommand(command);
      segs = p.ok ? p.segments : [];
    }
    const example = allowedExample(segs);
    if (example)
      return deny(
        'command',
        command,
        `${what} is not allowed in this run, but the line contains an allowed command. ${RUN_ALONE.replace('{example}', example)}`,
      );
    return deny('command', command, `${what} is not in the allowed command list for this run. ${NEEDS_APPROVAL}`);
  };

  for (const re of config.denyCommandPatterns) {
    if (new RegExp(re).test(command)) return notAllowed('This command (destructive pattern)');
  }
  const parsed = parseCommand(command);
  if (!parsed.ok) {
    return deny(
      'command',
      command,
      `This command (${parsed.reason}) is not allowed. Use plain commands without substitution, heredocs or subshells, one per call or chained with && or |.`,
    );
  }

  for (const seg of parsed.segments) {
    for (const token of [...seg.words, ...seg.redirects.map((redirect) => redirect.target)]) {
      if (seg.words[0] === 'git' && /^--(?:output|ext-diff|textconv|no-index)(?:=|$)/.test(token))
        return deny('command', command, `Git option "${token}" is outside the read-only policy. ${NEEDS_APPROVAL}`);
    }
  }

  const cd = parsed.segments.findIndex((seg) => seg.words[0] === 'cd');
  if (
    cd !== -1 &&
    (cd !== 0 ||
      parsed.segments.length < 2 ||
      parsed.segments.slice(1).some((seg, index) => seg.words[0] === 'cd' || (!seg.andThen && (!seg.piped || index === 0))))
  )
    return notAllowed('Use cd as the first command, followed by && rather than a pipe or fallback', parsed.segments);

  let prevAllowed = false;
  for (const seg of parsed.segments) {
    for (const r of seg.redirects) {
      if (r.target === '/dev/null') continue;
      if (/[$*?{}\[\]~]/.test(r.target)) return notAllowed(`Redirect target "${r.target}" (not statically known)`, parsed.segments);
      const base = resolve(ctx.projectRoot, cwd);
      const relativeTarget = toRelative(ctx.projectRoot, base, r.target);
      if (relativeTarget === null && r.op.startsWith('<')) return notAllowed('Input redirect points outside the checkout', parsed.segments);
      if (relativeTarget !== null && !isSafeShellPath(ctx.projectRoot, cwd, r.target))
        return notAllowed('Redirect path uses a symbolic link', parsed.segments);
      if (r.op.startsWith('<')) continue;
      const d = decideWrite(relativeTarget, r.target, ctx);
      if (!d.allow) return { ...d, target: command };
    }
    if (seg.words.length === 0) continue;
    if (seg.piped && prevAllowed && isOutputFilter(seg.words, filterNames)) {
      if (seg.redirects.some((r) => r.target !== '/dev/null'))
        return notAllowed(`"${seg.words.join(' ')}" (a filter may not redirect)`, parsed.segments);
      continue;
    }
    if (matchesAny(seg.words, allowList)) {
      prevAllowed = true;
      continue;
    }
    if (matchesAny(seg.words, readList)) {
      const r = checkReadCommand(seg, ctx, cwd);
      if (!r.ok) return notAllowed(r.what, parsed.segments);
      cwd = r.cwd;
      prevAllowed = true;
      continue;
    }
    return notAllowed(`"${seg.words.join(' ')}"`, parsed.segments);
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
    const cwd = toRelative(root, root, input.cwd ?? root);
    if (cwd === null || !isSafeShellPath(root, '', input.cwd ?? root))
      return deny('outside-root', command, 'Shell cwd is outside the checkout or uses a symbolic link.');
    return decideBash(command, ctx, cwd);
  }
  return allow;
}
