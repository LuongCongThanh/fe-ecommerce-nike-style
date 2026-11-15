/** Validation of the structured results agents return (schemas.ts types), tolerant of garbage: situation 13. */
import { RESULT_VALUES, type ImplementerResult, type PlannerResult, type ReviewerResult, type RetroNeedResult } from './schemas';
import { Stop } from './situations';

function asObject(v: unknown, who: string): Record<string, unknown> {
  if (!v || typeof v !== 'object' || Array.isArray(v))
    throw new Stop(13, `${who} trả kết quả không phải object: ${JSON.stringify(v)?.slice(0, 300)}`);
  return v as Record<string, unknown>;
}

function base(v: unknown, who: string) {
  const o = asObject(v, who);
  if (!(RESULT_VALUES as readonly unknown[]).includes(o.result)) throw new Stop(13, `${who} trả result lạ: ${JSON.stringify(o.result)}`);
  return { o, result: o.result as PlannerResult['result'], reason: typeof o.reason === 'string' ? o.reason : '' };
}

export function plannerResult(v: unknown): PlannerResult {
  const { o, result, reason } = base(v, 'planner');
  const questions = Array.isArray(o.questions) ? o.questions.filter((q): q is string => typeof q === 'string') : undefined;
  return { result, reason, questions };
}

export function implementerResult(v: unknown): ImplementerResult {
  const { o, result, reason } = base(v, 'implementer');
  const requested = o.requested as ImplementerResult['requested'];
  return { result, reason, commit_message: typeof o.commit_message === 'string' ? o.commit_message : undefined, requested };
}

export function reviewerResult(v: unknown): ReviewerResult {
  const { o, result, reason } = base(v, 'reviewer');
  const findings = Array.isArray(o.findings) ? (o.findings as ReviewerResult['findings']).filter((f) => f && typeof f.message === 'string') : [];
  return { result, reason, findings };
}

export function retroNeedResult(v: unknown): RetroNeedResult {
  const o = asObject(v, 'retro');
  const n = Number(o.turns_needed);
  return { turns_needed: Number.isFinite(n) && n > 0 ? Math.ceil(n) : 5, reason: typeof o.reason === 'string' ? o.reason : '' };
}

export const isBlocking = (f: { severity: string }): boolean => f.severity === 'blocker' || f.severity === 'major';
