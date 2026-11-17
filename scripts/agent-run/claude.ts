/**
 * The `claude -p` boundary: argument building, output parsing and the real runner.
 * Everything else talks to `ClaudeRunner`, which tests replace with a fake (a real call costs ~$0.1-0.7).
 */
import { trimLog, type Runner } from './exec';

export type AgentPhase = 'plan' | 'implement' | 'review' | 'retro';

export interface ClaudeRequest {
  cwd: string;
  prompt: string;
  phase: AgentPhase;
  /** `--agent <name>` (planner, implementer, reviewer) */
  agent?: string;
  /** `--resume <session id>` */
  resume?: string;
  /** JSON schema for `--json-schema` (answer comes back in `structured_output`) */
  schema?: object;
  /** Passed as `--max-turns` (the CLI overshoots by 1; caller counts `numTurns`) */
  maxTurns: number;
  /** Extra `--allowedTools` entries (e.g. browser MCP tools for the UI check) */
  extraTools?: string[];
  /** AGENT_RUN, AGENT_PHASE, AGENT_TASK_DIR, AGENT_APPROVED, ... merged over process.env */
  env: Record<string, string>;
}

export type ClaudeOutcome = 'ok' | 'max_turns' | 'crash' | 'bad_output';

export interface ClaudeResponse {
  kind: ClaudeOutcome;
  sessionId: string | null;
  numTurns: number;
  costUsd: number;
  usage?: { input: number; cached: number; output: number };
  structured: unknown;
  result: string | null;
  /** Human-readable cause for crash / bad_output / max_turns */
  detail: string;
}

export type ClaudeRunner = (req: ClaudeRequest) => Promise<ClaudeResponse>;

const READ_TOOLS = ['Read', 'Grep', 'Glob'];

/** `--allowedTools` per phase; mirrors the agent files and `allowCommands` of agent-guard.json. */
export function allowedToolsFor(phase: AgentPhase, allowCommands: string[]): string[] {
  switch (phase) {
    case 'plan':
      return [...READ_TOOLS, 'Write', 'Skill', 'Agent'];
    case 'review':
      return [...READ_TOOLS, 'Skill', 'Agent', 'Bash(git diff *)', 'Bash(git log *)'];
    case 'implement':
    case 'retro':
      return [...READ_TOOLS, 'Edit', 'Write', 'Skill', 'Agent', ...allowCommands.map((c) => `Bash(${c})`)];
  }
}

export function buildClaudeArgs(req: ClaudeRequest, allowCommands: string[]): string[] {
  const args = ['-p', req.prompt, '--output-format', 'json', '--max-turns', String(req.maxTurns), '--permission-prompts', 'none'];
  if (req.agent) args.push('--agent', req.agent);
  if (req.resume) args.push('--resume', req.resume);
  if (req.schema) args.push('--json-schema', JSON.stringify(req.schema));
  args.push('--allowedTools', [...allowedToolsFor(req.phase, allowCommands), ...(req.extraTools ?? [])].join(','));
  return args;
}

interface RawResult {
  subtype?: string;
  is_error?: boolean;
  num_turns?: number;
  session_id?: string;
  result?: string | null;
  structured_output?: unknown;
  errors?: string[];
  total_cost_usd?: number;
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

/** Keep only the fields we read, each with its expected type; anything else reads as absent. `null` = not an object. */
function toRawResult(value: unknown): RawResult | null {
  if (!isRecord(value)) return null;
  const raw: RawResult = {};
  if (typeof value.subtype === 'string') raw.subtype = value.subtype;
  if (typeof value.is_error === 'boolean') raw.is_error = value.is_error;
  if (typeof value.num_turns === 'number') raw.num_turns = value.num_turns;
  if (typeof value.session_id === 'string') raw.session_id = value.session_id;
  if (typeof value.result === 'string' || value.result === null) raw.result = value.result;
  if ('structured_output' in value) raw.structured_output = value.structured_output;
  if (Array.isArray(value.errors)) raw.errors = value.errors.filter((e): e is string => typeof e === 'string');
  if (typeof value.total_cost_usd === 'number') raw.total_cost_usd = value.total_cost_usd;
  return raw;
}

export function parseClaudeOutput(stdout: string, stderr: string, code: number, expectSchema: boolean): ClaudeResponse {
  const empty = { sessionId: null, numTurns: 0, costUsd: 0, structured: undefined, result: null };
  let parsed: unknown;
  try {
    parsed = JSON.parse(stdout);
  } catch {
    parsed = undefined; // not JSON at all: reported as a crash below
  }
  const raw = toRawResult(parsed);
  if (!raw) return { ...empty, kind: 'crash', detail: trimLog(`exit ${code}; stderr: ${stderr}\nstdout: ${stdout}`, 1500) };
  const base = {
    sessionId: raw.session_id ?? null,
    numTurns: raw.num_turns ?? 0,
    costUsd: raw.total_cost_usd ?? 0,
    structured: raw.structured_output,
    result: raw.result ?? null,
  };
  if (raw.subtype === 'error_max_turns') return { ...base, kind: 'max_turns', detail: (raw.errors ?? []).join('; ') || 'max turns reached' };
  if (raw.is_error || (raw.subtype ?? '').startsWith('error')) {
    const detail = [...(raw.errors ?? []), raw.result ?? '', stderr].filter(Boolean).join('; ') || `subtype ${raw.subtype ?? '?'}, exit ${code}`;
    return { ...base, kind: 'crash', detail: trimLog(detail, 1500) };
  }
  if (expectSchema && (raw.structured_output === undefined || raw.structured_output === null)) {
    // Measured 2026-11-16: with `--agent`, the CLI leaves structured_output empty and returns the JSON as text in `result`.
    const fromResult = objectFromText(raw.result ?? '');
    if (fromResult) return { ...base, structured: fromResult, kind: 'ok', detail: '' };
    return { ...base, kind: 'bad_output', detail: trimLog(`no structured_output; result: ${raw.result ?? ''}`, 1500) };
  }
  return { ...base, kind: 'ok', detail: '' };
}

/**
 * The JSON object in `text`: the whole text, else the last ```json fence, else a bare object that starts a line
 * and runs to the end (prose then JSON, seen from the reviewer). `null` when there is none.
 */
export function objectFromText(text: string): Record<string, unknown> | null {
  // Odd-indexed parts of a split on ``` are fence bodies; drop an optional "json" language tag.
  const fences = text
    .split('```')
    .filter((_, i) => i % 2 === 1)
    .map((body) => body.replace(/^json\b/, '').trim());
  const lines = text.split('\n');
  const trailingObjects = lines.map((line, i) => (line.trimStart().startsWith('{') ? lines.slice(i).join('\n').trim() : '')).filter(Boolean);
  const lastFirst = <T>(items: T[]): T[] => [...items].reverse();
  for (const candidate of [text.trim(), ...lastFirst(fences), ...trailingObjects]) {
    try {
      const value: unknown = JSON.parse(candidate);
      if (isRecord(value)) return value;
    } catch {
      // not JSON: try the next candidate
    }
  }
  return null;
}

export function realClaude(runner: Runner, allowCommands: string[], timeoutMs = 45 * 60_000): ClaudeRunner {
  return async (req) => {
    const r = await runner('claude', buildClaudeArgs(req, allowCommands), {
      cwd: req.cwd,
      env: { ...process.env, ...req.env },
      timeoutMs,
    });
    return parseClaudeOutput(r.stdout, r.stderr, r.code, req.schema !== undefined);
  };
}
