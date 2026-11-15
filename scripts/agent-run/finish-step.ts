/** Metric, the single commit, push and PR (D28, D32, D39; situations 11-13). The script does git, never the agent. */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { callClaude, setStage, type RunContext } from './context';
import { trimLog } from './exec';
import { prBodyFixPrompt, prBodyPrompt } from './prompts';
import { prBodySchema, type ReviewFinding } from './schemas';
import { setField } from './spec-file';
import { Stop } from './situations';
import { readState, updateState } from './state';
import { hasForbiddenWord, pickCommitMessage } from './text-rules';

/** Main spec -> worktree copy (answers and `approved:` live in the main checkout), optionally forcing status. */
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

async function writePrBody(ctx: RunContext, title: string, minor: ReviewFinding[], bundleNote: string): Promise<string> {
  const ask = async (prompt: string, resume?: string) => {
    const resp = await callClaude(ctx, { phase: 'review', prompt, resume, schema: prBodySchema, budget: ctx.cfg.prBodyTurns });
    if (resp.kind === 'max_turns')
      throw new Stop(12, 'Agent viết PR body hết lượt. Tự viết body rồi mở PR (branch đã commit, chưa push).', resp.detail);
    const body = (resp.structured as { body?: unknown } | undefined)?.body;
    if (typeof body !== 'string' || !body.trim()) throw new Stop(12, 'Agent không trả PR body.');
    return { body, session: resp.sessionId ?? undefined };
  };
  const first = await ask(prBodyPrompt({ taskDir: ctx.taskDir, branch: ctx.branch, commitSubject: title, minorFindings: minor, bundleNote }));
  let problems = await validatePrBody(ctx, title, first.body);
  if (problems.length === 0) return first.body;
  const second = await ask(prBodyFixPrompt(problems.join('\n')), first.session); // one agent fix (D28)
  problems = await validatePrBody(ctx, title, second.body);
  if (problems.length > 0)
    throw new Stop(12, `PR body vẫn sai sau 1 lần sửa: ${problems.join(' | ').slice(0, 400)}. Sửa tay rồi mở PR.`, problems.join('\n'));
  return second.body;
}

export interface FinishInput {
  minor: ReviewFinding[];
  bundleNote: string;
}

/** Returns the PR URL. Never merges. */
export async function finishStep(ctx: RunContext, input: FinishInput): Promise<string> {
  const { runner } = ctx.deps;
  const git = (args: string[]) => runner('git', args, { cwd: ctx.worktree });

  setStage(ctx, 'committing');
  const tokens = await runner('pnpm', ['tokens', '--project-dir', ctx.worktree, '--out', join(ctx.taskDir, 'metric.md')], { cwd: ctx.worktree });
  if (tokens.code !== 0) ctx.deps.log(`tokens failed (non fatal): ${trimLog(tokens.stderr, 300)}`);

  syncSpec(ctx, 'review');
  const proposed = readState(ctx.worktree).commitMessage;
  const message = pickCommitMessage(typeof proposed === 'string' ? proposed : undefined, { kind: ctx.task.kind, taskName: ctx.task.name, title: '' });
  const [subject = '', ...rest] = message.split('\n');
  const bodyText = rest.join('\n').trim();

  await git(['add', '-A']);
  const status = await git(['status', '--porcelain']);
  if (!status.stdout.trim()) throw new Stop(13, 'Không có thay đổi nào để commit sau khi chạy xong. Kiểm tra worktree.');
  const commitArgs = ['commit', '-m', subject, ...(bodyText ? ['-m', bodyText] : [])];
  const commit = await git(commitArgs);
  if (commit.code !== 0)
    throw new Stop(
      13,
      `git commit lỗi (hook husky?): ${trimLog(`${commit.stdout}\n${commit.stderr}`, 800)}. Worktree giữ nguyên ${ctx.worktree}.`,
      commit.stderr,
    );

  const body = await writePrBody(ctx, subject, input.minor, input.bundleNote);

  setStage(ctx, 'pushing');
  const push = await git(['push', '-u', 'origin', ctx.branch]);
  if (push.code !== 0)
    throw new Stop(12, `git push lỗi: ${trimLog(push.stderr, 600)}. Branch đã commit trong ${ctx.worktree}; push tay rồi mở PR.`, push.stderr);

  mkdirSync(join(ctx.worktree, '.agent-run'), { recursive: true });
  const bodyFile = join(ctx.worktree, '.agent-run', 'pr-body.md');
  writeFileSync(bodyFile, body);
  const pr = await runner('gh', ['pr', 'create', '--base', 'dev', '--head', ctx.branch, '--title', subject, '--body-file', bodyFile], {
    cwd: ctx.worktree,
  });
  const url = /https:\/\/\S+\/pull\/\d+/.exec(pr.stdout)?.[0];
  if (pr.code !== 0 || !url)
    throw new Stop(12, `gh pr create lỗi: ${trimLog(`${pr.stdout}\n${pr.stderr}`, 600)}. Branch đã push; mở PR tay.`, pr.stderr);
  updateState(ctx.worktree, (s) => {
    s.stage = 'done';
    s.prUrl = url;
  });
  return url;
}
