/**
 * JSON Schemas for the final result of each agent role (D21). Step 7 (`agent-run`) passes
 * `JSON.stringify(roleSchemas[role])` to `claude -p --json-schema` and reads `structured_output`.
 * Plain objects (no if/then, no $ref) so the CLI's structured-output tool accepts them;
 * rules that need more than that (commit_message required on ok, reason: needs_approval)
 * are validated by the script, see the *Result types below.
 */

export const RESULT_VALUES = ['ok', 'need_info', 'blocked'] as const;
export type ResultValue = (typeof RESULT_VALUES)[number];

export const FINDING_SEVERITIES = ['blocker', 'major', 'minor', 'nit'] as const;
export type FindingSeverity = (typeof FINDING_SEVERITIES)[number];

const result = {
  type: 'string',
  enum: [...RESULT_VALUES],
  description: 'ok = done; need_info = needs a human answer; blocked = cannot continue',
} as const;
const reason = { type: 'string', description: 'One or two sentences. For blocked on a guard denial use exactly "needs_approval"' } as const;

export const plannerSchema = {
  type: 'object',
  properties: {
    result,
    reason,
    questions: { type: 'array', items: { type: 'string' }, description: 'Required when result is need_info: the ambiguities to ask the human' },
  },
  required: ['result', 'reason'],
  additionalProperties: false,
} as const;

export const implementerSchema = {
  type: 'object',
  properties: {
    result,
    reason,
    commit_message: { type: 'string', description: 'Required when result is ok: conventional commit message, no tool/AI names' },
    requested: {
      type: 'object',
      description: 'When reason is needs_approval: what the guard denied',
      properties: {
        paths: { type: 'array', items: { type: 'string' } },
        commands: { type: 'array', items: { type: 'string' } },
      },
      required: ['paths', 'commands'],
      additionalProperties: false,
    },
  },
  required: ['result', 'reason'],
  additionalProperties: false,
} as const;

export const reviewerSchema = {
  type: 'object',
  properties: {
    result,
    reason,
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          severity: { type: 'string', enum: [...FINDING_SEVERITIES] },
          axis: { type: 'string', enum: ['standards', 'spec'] },
          file: { type: 'string' },
          message: { type: 'string' },
        },
        required: ['severity', 'message'],
        additionalProperties: false,
      },
    },
  },
  required: ['result', 'reason', 'findings'],
  additionalProperties: false,
} as const;

export const roleSchemas = {
  planner: plannerSchema,
  implementer: implementerSchema,
  reviewer: reviewerSchema,
} as const;

export type AgentRole = keyof typeof roleSchemas;

export interface PlannerResult {
  result: ResultValue;
  reason: string;
  questions?: string[];
}

export interface ImplementerResult {
  result: ResultValue;
  reason: string;
  /** Script must reject an `ok` without it, and sanitize it (commit-msg word list) */
  commit_message?: string;
  requested?: { paths: string[]; commands: string[] };
}

export interface ReviewFinding {
  severity: FindingSeverity;
  axis?: 'standards' | 'spec';
  file?: string;
  message: string;
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

/** Runtime check for one finding: the agent's JSON is only trusted after this. */
export function isReviewFinding(value: unknown): value is ReviewFinding {
  return (
    isRecord(value) &&
    (FINDING_SEVERITIES as readonly unknown[]).includes(value.severity) &&
    typeof value.message === 'string' &&
    (value.file === undefined || typeof value.file === 'string') &&
    (value.axis === undefined || value.axis === 'standards' || value.axis === 'spec')
  );
}

export interface ReviewerResult {
  result: ResultValue;
  reason: string;
  findings: ReviewFinding[];
}

/** Retro (D26/D43): one extra resume asks how many more turns the retro needs (situation 15). */
export const retroNeedSchema = {
  type: 'object',
  properties: {
    turns_needed: { type: 'number', description: 'How many more turns the retro needs to finish' },
    reason: { type: 'string', description: 'Why, in one or two sentences' },
  },
  required: ['turns_needed', 'reason'],
  additionalProperties: false,
} as const;

export interface RetroNeedResult {
  turns_needed: number;
  reason: string;
}

/** PR body writer: the body only; the title is the commit subject. */
export const prBodySchema = {
  type: 'object',
  properties: { body: { type: 'string', description: 'Complete PR body following .github/PULL_REQUEST_TEMPLATE.md' } },
  required: ['body'],
  additionalProperties: false,
} as const;
