import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { objectFromText, type ClaudeRequest, type ClaudeResponse, type ClaudeRunner } from './claude';
import { trimLog, type Runner } from './exec';

function quoteShell(value: string): string {
  return "'" + value.replaceAll("'", "'\\''") + "'";
}

export function parseCodexOutput(stdout: string, stderr: string, code: number, used: number, req: ClaudeRequest): ClaudeResponse {
  let sessionId: string | null = null;
  let result: string | null = null;
  let completed = false;
  let usage: ClaudeResponse['usage'];
  let failed = false;
  for (const line of stdout.split('\n')) {
    if (!line.trim()) continue;
    const event = objectFromText(line);
    if (event?.type === 'thread.started' && typeof event.thread_id === 'string') sessionId = event.thread_id;
    if (event?.type === 'turn.completed') {
      completed = true;
      const metrics = event.usage;
      if (metrics && typeof metrics === 'object') {
        const { input_tokens: input, cached_input_tokens: cached, output_tokens: output } = metrics as Record<string, unknown>;
        if (typeof input === 'number' && typeof cached === 'number' && typeof output === 'number') usage = { input, cached, output };
      }
    }
    if (event?.type === 'turn.failed') failed = true;
    if (
      event?.type === 'item.completed' &&
      event.item &&
      typeof event.item === 'object' &&
      'type' in event.item &&
      event.item.type === 'agent_message' &&
      'text' in event.item &&
      typeof event.item.text === 'string'
    )
      result = event.item.text;
  }
  const structured = req.schema && result ? (objectFromText(result) ?? undefined) : undefined;
  const base = { sessionId, result, structured, costUsd: 0, usage, numTurns: Math.min(used + 1, req.maxTurns) };
  if (used >= req.maxTurns) return { ...base, kind: 'max_turns', detail: 'Codex tool-call budget exhausted.' };
  if (code !== 0 || failed || !completed || result === null || sessionId === null)
    return { ...base, kind: 'crash', detail: trimLog(`Codex exit ${code}\n${stderr}\n${stdout}`, 1500) };
  if (req.schema && !structured) return { ...base, kind: 'bad_output', detail: trimLog(result, 1500) };
  return { ...base, kind: 'ok', detail: '' };
}

function hookConfig(repoRoot: string): string {
  const hook = [join(repoRoot, 'node_modules/.bin/tsx'), join(repoRoot, 'scripts/agent-run/codex-guard.ts')].map(quoteShell).join(' ');
  return `hooks.PreToolUse=[{matcher=".*",hooks=[{type="command",command=${JSON.stringify(hook)}}]}]`;
}

export function codexProvider(runner: Runner, repoRoot: string) {
  async function invoke(req: ClaudeRequest, probe = false) {
    const tmp = mkdtempSync(join(tmpdir(), 'storefront-codex-'));
    const ledger = join(tmp, 'calls');
    writeFileSync(ledger, '');
    try {
      const args = ['-a', 'never', '-s', 'workspace-write', 'exec'];
      if (req.resume) args.push('resume');
      args.push('--json', '-c', hookConfig(repoRoot));
      const browser = !probe && req.extraTools?.includes('mcp__playwright') ? /http:\/\/localhost:\d+/.exec(req.prompt)?.[0] : undefined;
      if (browser) {
        args.push('-c', 'mcp_servers.playwright.command="npx"', '-c', 'mcp_servers.playwright.args=["-y","@playwright/mcp@0.0.85","--headless"]');
      }
      if (req.resume) args.push(req.resume);
      const schemaPrompt = req.schema ? `\nReturn only a JSON object matching this schema: ${JSON.stringify(req.schema)}` : '';
      const role = req.agent
        ? `Use this storefront role definition:\n${readFileSync(join(repoRoot, '.codex/agents', req.agent + '.toml'), 'utf8')}\n`
        : '';
      const workflow = probe
        ? ''
        : 'Work in the existing checkout. Follow skill procedures inline and sequentially. Use read-only shell commands for inspection and apply_patch for permitted edits. The runner owns Git writes.\n';
      args.push('--', workflow + role + req.prompt + schemaPrompt);
      const response = await runner('codex', args, {
        cwd: req.cwd,
        timeoutMs: probe ? 45_000 : 12 * 60_000,
        env: {
          ...process.env,
          ...req.env,
          AGENT_CODEX_ROOT: req.cwd,
          AGENT_CODEX_LEDGER: ledger,
          AGENT_CODEX_POLICY: join(repoRoot, '.claude/agent-guard.json'),
          AGENT_CODEX_STOP: join(repoRoot, '.agent-stop'),
          AGENT_CODEX_LIMIT: String(req.maxTurns),
          AGENT_CODEX_BROWSER: browser,
          AGENT_CODEX_PROBE: probe ? '1' : '0',
        },
      });
      const used = readFileSync(ledger, 'utf8').split('\n').length - 1;
      return { ...response, used };
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  }

  const run: ClaudeRunner = async (req) => {
    const r = await invoke(req);
    return parseCodexOutput(r.stdout, r.stderr, r.code, r.used, req);
  };

  return {
    run,
    async preflight(cwd: string, taskDir: string): Promise<void> {
      const r = await invoke(
        {
          cwd,
          phase: 'plan',
          maxTurns: 5,
          prompt: 'Run the exact shell command `echo storefront_guard_probe` once using the shell tool. Then reply with its outcome.',
          env: { AGENT_RUN: '1', AGENT_PHASE: 'plan', AGENT_TASK_DIR: taskDir },
        },
        true,
      );
      if (r.stdout.includes('Exceeded skills context budget')) {
        throw new Error(
          'Codex vượt giới hạn danh mục skill trước khi chạy phép thử. Dùng cấu hình Codex với ít skill hơn rồi chạy lại --check-provider.',
        );
      }
      if (r.code !== 0 || r.used < 1 || !r.stderr.includes('agent-guard: Only read-only shell commands are available in this phase.')) {
        throw new Error(
          `Codex PreToolUse chưa xác nhận đã chặn lệnh thử (exit ${r.code}, ${r.used} hook calls). ` +
            `Kiểm tra đăng nhập và mở /hooks bằng lệnh codex -c ${quoteShell(hookConfig(repoRoot))} để duyệt hook.\n` +
            trimLog(r.stderr + '\n' + r.stdout, 1000),
        );
      }
    },
  };
}
