/**
 * Implementer, gates, fix loop, UI checks and review (D19, D27, D30, D35, D38; situations 5-9, 14).
 * One shared fix counter (`fixAttempts` in state.json) covers Stop-hook blocks, red gates and review findings.
 */
import { randomUUID } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';

import { callClaude, setStage, type RunContext } from './context';
import { trimLog } from './exec';
import { fixPrompt, implementerPrompt, reviewerPrompt, uiCheckPrompt } from './prompts';
import { implementerResult, isBlocking, reviewerResult } from './results';
import { implementerSchema, reviewerSchema, uiSchema, type ReviewFinding } from './schemas';
import { SITUATION, Stop } from './situations';
import { markStepDone, readState, resetStepsFrom, updateState } from './state';
import { validateUiEvidence } from './ui-evidence';
import { writeQuestions } from './plan-step';

async function runImplementer(ctx: RunContext, prompt: string, resume?: string): Promise<void> {
  const resp = await callClaude(ctx, { phase: 'implement', agent: 'implementer', prompt, resume, schema: implementerSchema, budget: 'task' });
  const r = implementerResult(resp.structured);
  updateState(ctx.worktree, (s) => {
    if (resp.sessionId) s.implementerSession = resp.sessionId;
    if (r.commit_message) s.commitMessage = r.commit_message;
  });
  if (r.result === 'need_info' || (r.result === 'blocked' && r.reason.startsWith('needs_approval'))) {
    // A person answers or approves, so the next run must hand the implementer the new spec again, even
    // when this call was a fix after the first implementation had already completed.
    resetStepsFrom(ctx.worktree, 'implement');
  }
  if (r.result === 'need_info') {
    writeQuestions(ctx, [r.reason], 'implementer');
    throw new Stop(
      SITUATION.needInfo,
      `Implementer cần quyết định trong spec ${ctx.task.name}: ${r.reason}. Trả lời rồi đặt lại ready-for-agent.`,
      r.reason,
    );
  }
  if (r.result === 'blocked') {
    if (r.reason.startsWith('needs_approval')) {
      const req = r.requested ? ` files: ${r.requested.paths.join(', ') || '-'}; lệnh: ${r.requested.commands.join(', ') || '-'}` : '';
      throw new Stop(
        SITUATION.needsApproval,
        `Implementer cần quyền chưa duyệt.${req} Thêm vào approved: của spec ${ctx.task.name} rồi đặt lại ready-for-agent.`,
        r.reason,
      );
    }
    if ((readState(ctx.worktree).fixAttempts ?? 0) >= ctx.cfg.maxFixes)
      throw new Stop(SITUATION.gatesRed, `Gate vẫn đỏ sau ${ctx.cfg.maxFixes} lần sửa: ${r.reason}`, r.reason);
    throw new Stop(SITUATION.other, `Implementer báo blocked: ${r.reason}`, r.reason);
  }
}

export async function implementStep(ctx: RunContext, resumed: boolean): Promise<void> {
  setStage(ctx, 'implementing');
  await runImplementer(ctx, implementerPrompt(ctx.taskDir, resumed));
  markStepDone(ctx.worktree, 'implement');
}

/** Spend one of the shared fixes (or stop with situation 7) and resume the implementer session. */
async function fix(ctx: RunContext, reason: string, details: string): Promise<void> {
  if ((readState(ctx.worktree).fixAttempts ?? 0) >= ctx.cfg.maxFixes) {
    throw new Stop(
      SITUATION.gatesRed,
      `Còn lỗi sau ${ctx.cfg.maxFixes} lần sửa: ${reason}. Xem chi tiết trong ${ctx.worktree}; sửa tay hoặc làm rõ spec rồi đặt lại ready-for-agent.`,
      details,
    );
  }
  updateState(ctx.worktree, (s) => (s.fixAttempts = (s.fixAttempts ?? 0) + 1));
  await runImplementer(ctx, fixPrompt(reason, details), readState(ctx.worktree).implementerSession);
}

const gateReportSchema = z.object({
  gates: z.array(z.object({ name: z.string(), status: z.string(), log: z.string() })).optional(),
  bundle: z
    .object({
      regressions: z.array(z.object({ route: z.string(), baseline: z.number(), current: z.number(), increasePct: z.number() })).optional(),
      newRoutes: z.array(z.object({ route: z.string(), firstLoadUncompressedJsBytes: z.number() })).optional(),
    })
    .optional(),
});
type GateReport = z.infer<typeof gateReportSchema>;

/** verify-gates stdout -> report; anything unreadable is an empty report (the exit code still decides). */
export function parseGateReport(stdout: string): GateReport {
  const i = stdout.indexOf('{');
  try {
    const parsed = gateReportSchema.safeParse(JSON.parse(i >= 0 ? stdout.slice(i) : stdout));
    return parsed.success ? parsed.data : {};
  } catch {
    return {}; // not JSON (e.g. a crash message)
  }
}

function gateSummary(report: GateReport, raw: string): string {
  const failed = (report.gates ?? []).filter((g) => g.status === 'fail');
  if (failed.length === 0) return trimLog(raw, 2000);
  return failed.map((g) => `### ${g.name}\n${g.log}`).join('\n\n');
}

/** verify-gates; red -> fix (shared max), bundle regression -> situation 14 with no fix. */
export async function verifyAndFix(ctx: RunContext): Promise<string> {
  for (;;) {
    setStage(ctx, 'verifying');
    const args = ['exec', 'tsx', 'scripts/verify-gates.ts', '--worktree', ctx.worktree, '--with-build'];
    if (ctx.task.kind) args.push('--kind', ctx.task.kind);
    args.push('--task-dir', ctx.taskDir); // D38 test rule is re-checked here, as a gate (red -> fix loop -> situation 7)
    const r = await ctx.deps.runner('pnpm', args, { cwd: ctx.worktree, timeoutMs: 40 * 60_000 });
    const report = parseGateReport(r.stdout);
    if (r.code === 0) {
      const added = report.bundle?.newRoutes ?? [];
      return added.length
        ? `Route mới (chưa có baseline, chỉ ghi nhận): ${added.map((n) => `${n.route} ${n.firstLoadUncompressedJsBytes} B`).join(', ')}.`
        : '';
    }
    if (r.code === 2) {
      const lines = (report.bundle?.regressions ?? []).map((g) => `${g.route} +${g.increasePct.toFixed(1)}% (${g.baseline} -> ${g.current} B)`);
      throw new Stop(
        SITUATION.bundleGrowth,
        `First Load JS tăng quá 10%: ${lines.join('; ') || 'xem verify-gates'}. Quyết định chấp nhận hay giảm bundle; agent không tự sửa.`,
        lines.join('\n'),
      );
    }
    if (r.code !== 1) throw new Stop(SITUATION.other, `verify-gates lỗi (exit ${r.code}): ${trimLog(`${r.stdout}\n${r.stderr}`, 800)}`, r.stderr);
    await fix(ctx, 'verify-gates báo đỏ.', gateSummary(report, `${r.stdout}\n${r.stderr}`));
  }
}

// ---- UI checks (D30): clearly separated, minimal; tuned in step 8 ----
export async function uiCheck(ctx: RunContext): Promise<ReviewFinding[]> {
  if (ctx.task.kind !== 'ui') return [];
  setStage(ctx, 'ui-check');
  const server = await ctx.deps.devServer.start(ctx.worktree, ctx.cfg.devPort);
  if (!server.ok)
    throw new Stop(
      SITUATION.preStart,
      `Không khởi động được pnpm dev --port ${ctx.cfg.devPort} để kiểm tra UI: ${server.reason}. Giải phóng cổng rồi chạy lại.`,
      server.reason,
    );
  const origin = `http://localhost:${ctx.cfg.devPort}`;
  const artifact = resolve(ctx.taskDir, `ui-${randomUUID()}.png`);
  const started = Date.now();
  try {
    const resp = await callClaude(ctx, {
      phase: 'review',
      prompt: uiCheckPrompt(ctx.taskDir, origin, artifact),
      schema: uiSchema,
      budget: 'task',
      extraTools: ['mcp__playwright'],
    });
    try {
      const findings = validateUiEvidence(resp.structured, ctx.worktree, origin, artifact, started);
      writeFileSync(`${artifact}.json`, JSON.stringify(resp.structured, null, 2) + '\n', { flag: 'wx' });
      return findings;
    } catch (error) {
      throw new Stop(SITUATION.other, `UI check failed: ${String(error)}`, String(error));
    }
  } finally {
    await server.stop();
  }
}

export interface ReviewOutcome {
  /** Non-blocking findings, for the PR body */
  minor: ReviewFinding[];
  /** Set when a fix after review changed the bundle note */
  bundleNote?: string;
}

/** One review pass; blocker/major findings go through the fix loop (counted), then gates run again. */
export async function reviewStep(ctx: RunContext, uiFindings: ReviewFinding[]): Promise<ReviewOutcome> {
  setStage(ctx, 'reviewing');
  const resp = await callClaude(ctx, {
    phase: 'review',
    agent: 'reviewer',
    prompt: reviewerPrompt(ctx.taskDir),
    schema: reviewerSchema,
    budget: 'task',
  });
  const r = reviewerResult(resp.structured);
  if (r.result === 'need_info' || (r.result === 'blocked' && r.reason !== 'changes_requested' && !r.findings.some(isBlocking))) {
    throw new Stop(SITUATION.other, `Reviewer báo ${r.result}: ${r.reason}`, r.reason);
  }
  const all = [...uiFindings, ...r.findings];
  const blocking = all.filter(isBlocking);
  if (blocking.length > 0) {
    const text = blocking.map((f) => `- [${f.severity}] ${f.file ?? ''} ${f.message}`).join('\n');
    await fix(ctx, 'Review có phát hiện blocker/major cần sửa.', text);
    const bundleNote = await verifyAndFix(ctx);
    return { minor: all.filter((f) => !isBlocking(f)), bundleNote };
  }
  return { minor: all.filter((f) => !isBlocking(f)) };
}
