/** Validation of the structured results agents return (schemas.ts types), tolerant of garbage: situation 13. */
import {
  isReviewFinding,
  RESULT_VALUES,
  type ImplementerResult,
  type PlannerResult,
  type RetroNeedResult,
  type ResultValue,
  type ReviewerResult,
} from './schemas';
import { SITUATION, Stop } from './situations';

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function asObject(v: unknown, who: string): Record<string, unknown> {
  if (!isObject(v)) throw new Stop(SITUATION.other, `${who} trả kết quả không phải object: ${JSON.stringify(v)?.slice(0, 300)}`);
  return v;
}

function isResultValue(v: unknown): v is ResultValue {
  return (RESULT_VALUES as readonly unknown[]).includes(v);
}

function base(v: unknown, who: string) {
  const o = asObject(v, who);
  const result = o.result;
  if (!isResultValue(result)) throw new Stop(SITUATION.other, `${who} trả result lạ: ${JSON.stringify(result)}`);
  return { o, result, reason: typeof o.reason === 'string' ? o.reason : '' };
}

export function plannerResult(v: unknown): PlannerResult {
  const { o, result, reason } = base(v, 'planner');
  const questions = Array.isArray(o.questions) ? o.questions.filter((q): q is string => typeof q === 'string') : undefined;
  return { result, reason, questions };
}

const stringList = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);

function parseRequested(v: unknown): ImplementerResult['requested'] {
  return isObject(v) ? { paths: stringList(v.paths), commands: stringList(v.commands) } : undefined;
}

export function implementerResult(v: unknown): ImplementerResult {
  const { o, result, reason } = base(v, 'implementer');
  const requested = parseRequested(o.requested);
  return { result, reason, commit_message: typeof o.commit_message === 'string' ? o.commit_message : undefined, requested };
}

export function reviewerResult(v: unknown): ReviewerResult {
  const { o, result, reason } = base(v, 'reviewer');
  const findings = Array.isArray(o.findings) ? o.findings.filter(isReviewFinding) : [];
  return { result, reason, findings };
}

export function retroNeedResult(v: unknown): RetroNeedResult {
  const o = asObject(v, 'retro');
  const n = Number(o.turns_needed);
  return { turns_needed: Number.isFinite(n) && n > 0 ? Math.ceil(n) : 5, reason: typeof o.reason === 'string' ? o.reason : '' };
}

export const isBlocking = (f: { severity: string }): boolean => f.severity === 'blocker' || f.severity === 'major';
