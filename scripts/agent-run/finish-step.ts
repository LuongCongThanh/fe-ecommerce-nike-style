/** Metric, the single commit, push and PR (D28, D32, D39; situations 11-13). The script does git, never the agent. */
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { upsertTokenSection } from '../token-usage';

import { callClaude, setStage, type RunContext } from './context';
import { trimLog } from './exec';
import { prBodyFixPrompt, prBodyPrompt } from './prompts';
import { prBodySchema, type ReviewFinding } from './schemas';
import { setField } from './spec-file';
import { SITUATION, Stop } from './situations';
import { isStepDone, markStepDone, readState, updateState } from './state';
import { HANDOFF_FILE } from './handoff-step';
import { hasForbiddenWord, pickCommitMessage } from './text-rules';

/** Record the task status in the spec on the branch being committed. */
export function syncSpec(ctx: RunContext, status?: string): void {
  mkdirSync(ctx.taskDir, { recursive: true });
  let text = readFileSync(ctx.task.specPath, 'utf8');
  if (status) text = setField(text, 'status', status);
  writeFileSync(join(ctx.taskDir, 'spec.md'), text);
}

export async function validatePrBody(ctx: RunContext, title: string, body: string): Promise<string[]> {
  const problems: string[] = [];
  if (hasForbiddenWord(title) || hasForbiddenWord(body))
    problems.push('Title or body contains a word the PR lint forbids (AI tool or model names, the agent folder, the root guidance file name).');
  const r = await ctx.deps.runner('bash', ['scripts/check-pr-body.sh'], { cwd: ctx.worktree, env: { ...process.env, BODY: body } });
  if (r.code !== 0) problems.push(`scripts/check-pr-body.sh failed:\n${trimLog(`${r.stdout}\n${r.stderr}`, 1200)}`);
  return problems;
}

/** The `body` string of the structured PR-body answer, or null when absent or blank. */
function prBodyOf(structured: unknown): string | null {
  if (typeof structured !== 'object' || structured === null || !('body' in structured)) return null;
  return typeof structured.body === 'string' && structured.body.trim() ? structured.body : null;
}

async function writePrBody(ctx: RunContext, title: string, minor: ReviewFinding[], bundleNote: string): Promise<string> {
  const ask = async (prompt: string, resume?: string) => {
    const resp = await callClaude(ctx, { phase: 'review', prompt, resume, schema: prBodySchema, budget: ctx.cfg.prBodyTurns });
    if (resp.kind === 'max_turns')
      throw new Stop(SITUATION.pushFailed, 'Agent viết PR body hết lượt. Tự viết body rồi mở PR (branch đã commit, chưa push).', resp.detail);
    const body = prBodyOf(resp.structured);
    if (!body) throw new Stop(SITUATION.pushFailed, 'Agent không trả PR body.');
    return { body, session: resp.sessionId ?? undefined };
  };
  const first = await ask(prBodyPrompt({ taskDir: ctx.taskDir, branch: ctx.branch, commitSubject: title, minorFindings: minor, bundleNote }));
  let problems = await validatePrBody(ctx, title, first.body);
  if (problems.length === 0) return first.body;
  const second = await ask(prBodyFixPrompt(problems.join('\n')), first.session); // one agent fix (D28)
  problems = await validatePrBody(ctx, title, second.body);
  if (problems.length > 0)
    throw new Stop(
      SITUATION.pushFailed,
      `PR body vẫn sai sau 1 lần sửa: ${problems.join(' | ').slice(0, 400)}. Sửa tay rồi mở PR.`,
      problems.join('\n'),
    );
  return second.body;
}

export interface FinishInput {
  minor: ReviewFinding[];
  bundleNote: string;
}

/** Commits once (unless the commit already exists) and returns the subject; the body goes to the PR. */
async function commitOnce(ctx: RunContext): Promise<string> {
  const { runner } = ctx.deps;
  const git = (args: string[]) => runner('git', args, { cwd: ctx.worktree });
  const recorded = readState(ctx.worktree).commitSubject;
  if (isStepDone(ctx.worktree, 'committed') && recorded !== undefined) return recorded; // resume after a push/PR failure

  setStage(ctx, 'committing');
  const metric = join(ctx.taskDir, 'metric.md');
  const { startedAt, codexUsage } = readState(ctx.worktree);
  if (ctx.cfg.provider === 'codex') {
    if (codexUsage) {
      const { input, cached, output } = codexUsage;
      const note = `Input: ${input} (cached: ${cached}); output: ${output}. Tổng theo lượt hoàn tất trước khi commit.`;
      const existing = existsSync(metric) ? readFileSync(metric, 'utf8') : undefined;
      writeFileSync(metric, upsertTokenSection(existing, '', note));
    }
  } else {
    const tokenArgs = ['tokens', 'all', '--project-dir', ctx.worktree, '--out', metric];
    if (startedAt) tokenArgs.push('--since', startedAt);
    const tokens = await runner('pnpm', tokenArgs, { cwd: ctx.worktree });
    if (tokens.code !== 0) ctx.deps.log(`tokens failed (non fatal): ${trimLog(tokens.stderr, 300)}`);
  }

  syncSpec(ctx, 'review');
  rmSync(join(ctx.taskDir, HANDOFF_FILE), { force: true }); // written by an earlier stop; obsolete once the run completes
  const message = pickCommitMessage(readState(ctx.worktree).commitMessage, { kind: ctx.task.kind, taskName: ctx.task.name, title: '' });
  const [subject = '', ...rest] = message.split('\n');
  const bodyText = rest.join('\n').trim();

  const currentBranch = await git(['branch', '--show-current']);
  if (currentBranch.code !== 0 || currentBranch.stdout.trim() !== ctx.branch)
    throw new Stop(SITUATION.workspaceBusy, `Checkout đã rời branch ${ctx.branch}. Chuyển về đúng branch trước khi commit.`);
  const staged = await git(['add', '-A']);
  if (staged.code !== 0) throw new Stop(SITUATION.other, `Không thể stage thay đổi của task: ${trimLog(staged.stderr, 600)}`);
  const status = await git(['status', '--porcelain']);
  if (!status.stdout.trim()) throw new Stop(SITUATION.other, 'Không có thay đổi nào để commit sau khi chạy xong. Kiểm tra worktree.');
  const commit = await git(['commit', '-m', subject, ...(bodyText ? ['-m', bodyText] : [])]);
  if (commit.code !== 0)
    throw new Stop(
      SITUATION.other,
      `git commit lỗi (hook husky?): ${trimLog(`${commit.stdout}\n${commit.stderr}`, 800)}. Worktree giữ nguyên ${ctx.worktree}.`,
      commit.stderr,
    );
  updateState(ctx.worktree, (s) => (s.commitSubject = subject));
  markStepDone(ctx.worktree, 'committed');
  return subject;
}

/** Returns the PR URL. Never merges. Each part is skipped when state.json says it is done (resume after situation 12). */
export async function finishStep(ctx: RunContext, input: FinishInput): Promise<string> {
  const { runner } = ctx.deps;
  const git = (args: string[]) => runner('git', args, { cwd: ctx.worktree });

  const subject = await commitOnce(ctx);

  let body = readState(ctx.worktree).prBody;
  if (body === undefined) {
    body = await writePrBody(ctx, subject, input.minor, input.bundleNote);
    const written = body;
    updateState(ctx.worktree, (s) => (s.prBody = written));
  }

  if (!isStepDone(ctx.worktree, 'pushed')) {
    setStage(ctx, 'pushing');
    const push = await git(['push', '-u', 'origin', ctx.branch]);
    if (push.code !== 0)
      throw new Stop(
        SITUATION.pushFailed,
        `git push lỗi: ${trimLog(push.stderr, 600)}. Branch đã commit trong ${ctx.worktree}; đặt lại ready-for-agent để chạy tiếp từ bước push, hoặc push tay rồi mở PR.`,
        push.stderr,
      );
    markStepDone(ctx.worktree, 'pushed');
  }

  mkdirSync(join(ctx.worktree, '.agent-run'), { recursive: true });
  const bodyFile = join(ctx.worktree, '.agent-run', 'pr-body.md');
  writeFileSync(bodyFile, body);
  const pr = await runner('gh', ['pr', 'create', '--base', 'dev', '--head', ctx.branch, '--title', subject, '--body-file', bodyFile], {
    cwd: ctx.worktree,
  });
  const url = /https:\/\/\S+\/pull\/\d+/.exec(pr.stdout)?.[0];
  if (pr.code !== 0 || !url)
    throw new Stop(
      SITUATION.pushFailed,
      `gh pr create lỗi: ${trimLog(`${pr.stdout}\n${pr.stderr}`, 600)}. Branch đã push; đặt lại ready-for-agent để thử lại bước tạo PR, hoặc mở PR tay.`,
      pr.stderr,
    );
  updateState(ctx.worktree, (s) => {
    s.stage = 'done';
    s.prUrl = url;
  });
  return url;
}
