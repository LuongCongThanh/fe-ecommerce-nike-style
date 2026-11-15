/**
 * Đếm token Claude Code thực tế đã dùng cho một task, đọc từ transcript JSONL
 * của Claude Code (~/.claude/projects/<slug>/<session>.jsonl + subagents/).
 * Bản chỉnh từ be-demo/scripts/token-usage.ts (D12/D20).
 *
 * Phân loại output token của mỗi assistant message theo file nó ghi (Write/Edit):
 *   code  = src/**  (không phải test)
 *   test  = *.test.ts(x), *.spec.ts(x), e2e/**
 *   docs  = *.md, docs/**
 *   other = file khác (config, scripts…)
 *   explore/chat = message không ghi file (đọc code, chạy lệnh, trả lời)
 * Message ghi nhiều loại file thì chia đều token cho các loại đó.
 *
 * Usage:
 *   pnpm tokens <sessionId|prefix|latest> [...more]
 *     [--project-dir <worktree path>]  thư mục làm việc của session (mặc định: cwd)
 *     [--since 2026-11-07T00:00] [--until ...]
 *     [--md]                           in bảng markdown
 *     [--out <metric.md>]              ghi/cập nhật mục "Token (đo thật)" trong metric.md
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

type Category = 'code' | 'test' | 'docs' | 'other' | 'explore/chat';
const CATEGORIES: Category[] = ['code', 'test', 'docs', 'other', 'explore/chat'];
const WRITE_TOOLS = new Set(['Write', 'Edit', 'NotebookEdit']);
const TOKEN_HEADING = '## Token (đo thật)';

interface Usage {
  input_tokens?: number;
  output_tokens?: number;
  cache_creation_input_tokens?: number;
  cache_read_input_tokens?: number;
}
interface ContentBlock {
  type: string;
  name?: string;
  input?: { file_path?: string };
}
interface Line {
  type?: string;
  timestamp?: string;
  message?: { id?: string; usage?: Usage; content?: ContentBlock[] | string };
}

export interface Row {
  name: string;
  messages: number;
  input: number;
  cacheWrite: number;
  cacheRead: number;
  output: number;
}
const emptyRow = (name: string): Row => ({ name, messages: 0, input: 0, cacheWrite: 0, cacheRead: 0, output: 0 });

export function encodeProjectDir(path: string): string {
  return path.replace(/[^a-zA-Z0-9]/g, '-');
}

export function classify(filePath: string, root: string): Category {
  const p = relative(root, filePath);
  if (/\.(test|spec)\.tsx?$/.test(p) || p.startsWith('e2e/')) return 'test';
  if (p.endsWith('.md') || p.startsWith('docs/')) return 'docs';
  if (p.startsWith('src/')) return 'code';
  return 'other';
}

export interface Options {
  ids: string[];
  since?: string;
  until?: string;
  projectDir?: string;
  out?: string;
  asMarkdown: boolean;
}

export function parseArgs(argv: string[]): Options {
  const options: Options = { ids: [], asMarkdown: false };
  const valueFlags = new Map<string, 'since' | 'until' | 'projectDir' | 'out'>([
    ['--since', 'since'],
    ['--until', 'until'],
    ['--project-dir', 'projectDir'],
    ['--out', 'out'],
  ]);
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i] as string;
    const key = valueFlags.get(arg);
    if (arg === '--md') options.asMarkdown = true;
    else if (key) {
      const value = argv[++i];
      if (!value || value.startsWith('--')) throw new Error(`${arg} cần một giá trị.`);
      options[key] = value;
    } else if (arg.startsWith('--')) throw new Error(`Cờ không hỗ trợ: ${arg}`);
    else options.ids.push(arg);
  }
  if (options.ids.length === 0) throw new Error('Cần ít nhất một sessionId (hoặc "latest").');
  return options;
}

/** Nhận full id, tiền tố id hoặc `latest`; không khớp thì báo lỗi thay vì in 0. */
function resolveSession(dir: string, id: string): string {
  if (!existsSync(dir)) throw new Error(`Không có thư mục transcript: ${dir} (kiểm tra --project-dir).`);
  const sessions = readdirSync(dir)
    .filter((f) => f.endsWith('.jsonl'))
    .map((f) => ({ id: f.slice(0, -'.jsonl'.length), mtime: statSync(join(dir, f)).mtimeMs }));
  if (id === 'latest') {
    const newest = sessions.sort((a, b) => b.mtime - a.mtime)[0];
    if (!newest) throw new Error(`Không có session nào trong ${dir}.`);
    return newest.id;
  }
  const matches = sessions.filter((s) => s.id.startsWith(id));
  if (matches.length === 0) throw new Error(`Không tìm thấy session "${id}" trong ${dir}.`);
  if (matches.length > 1) throw new Error(`"${id}" khớp nhiều session: ${matches.map((m) => m.id).join(', ')}.`);
  return (matches[0] as { id: string }).id;
}

function sessionFiles(dir: string, id: string): string[] {
  const files = [join(dir, `${id}.jsonl`)];
  const sub = join(dir, id, 'subagents');
  if (existsSync(sub)) {
    for (const f of readdirSync(sub)) if (f.endsWith('.jsonl')) files.push(join(sub, f));
  }
  return files;
}

/**
 * Một message API có thể bị ghi thành nhiều dòng (cùng message.id) → gộp theo id,
 * giữ `usage` của dòng sau cùng và gom file từ mọi dòng.
 */
function collectMessages(files: string[], since?: string, until?: string) {
  const messages = new Map<string, { usage: Usage; files: string[] }>();
  for (const file of files) {
    for (const raw of readFileSync(file, 'utf8').split('\n')) {
      if (!raw.trim()) continue;
      let line: Line;
      try {
        line = JSON.parse(raw) as Line;
      } catch {
        continue;
      }
      const msg = line.message;
      if (line.type !== 'assistant' || !msg?.id || !msg.usage) continue;
      if (since && (line.timestamp ?? '') < since) continue;
      if (until && (line.timestamp ?? '') > until) continue;
      const entry = messages.get(msg.id) ?? { usage: msg.usage, files: [] };
      entry.usage = msg.usage;
      if (Array.isArray(msg.content)) {
        for (const block of msg.content) {
          if (block.type === 'tool_use' && WRITE_TOOLS.has(block.name ?? '') && block.input?.file_path) {
            entry.files.push(block.input.file_path);
          }
        }
      }
      messages.set(msg.id, entry);
    }
  }
  return messages;
}

function addUsage(row: Row, usage: Usage, share: number): void {
  row.input += (usage.input_tokens ?? 0) * share;
  row.cacheWrite += (usage.cache_creation_input_tokens ?? 0) * share;
  row.cacheRead += (usage.cache_read_input_tokens ?? 0) * share;
  row.output += (usage.output_tokens ?? 0) * share;
  row.messages += share;
}

export interface MeasureInput {
  /** Thư mục chứa các project transcript (mặc định `~/.claude/projects`); tiêm vào khi test. */
  baseDir: string;
  /** Thư mục làm việc của session (worktree); suy ra tên thư mục transcript. */
  root: string;
  ids: string[];
  since?: string;
  until?: string;
}

export function measure({ baseDir, root, ids, since, until }: MeasureInput): { sessions: string[]; rows: Row[] } {
  const dir = join(baseDir, encodeProjectDir(root));
  const sessions = ids.map((id) => resolveSession(dir, id));
  const messages = collectMessages(
    sessions.flatMap((id) => sessionFiles(dir, id)),
    since,
    until,
  );
  const buckets = new Map<string, Row>(CATEGORIES.map((c) => [c, emptyRow(c)]));
  const total = emptyRow('TOTAL');
  for (const { usage, files } of messages.values()) {
    const categories: Category[] = files.length ? [...new Set(files.map((f) => classify(f, root)))] : ['explore/chat'];
    for (const c of categories) addUsage(buckets.get(c) as Row, usage, 1 / categories.length);
    addUsage(total, usage, 1);
  }
  const rows = [...buckets.values(), total].map((r) => ({
    name: r.name,
    messages: Math.round(r.messages),
    input: Math.round(r.input),
    cacheWrite: Math.round(r.cacheWrite),
    cacheRead: Math.round(r.cacheRead),
    output: Math.round(r.output),
  }));
  return { sessions, rows };
}

const HEADER = ['Loại', 'Messages', 'Input', 'Cache write', 'Cache read', 'Output'];
const fmt = (n: number): string => n.toLocaleString('en-US');
const cells = (r: Row): string[] => [r.name, fmt(r.messages), fmt(r.input), fmt(r.cacheWrite), fmt(r.cacheRead), fmt(r.output)];

export function renderMarkdown(rows: Row[]): string {
  return [`| ${HEADER.join(' | ')} |`, `| ${HEADER.map(() => '---').join(' | ')} |`, ...rows.map((r) => `| ${cells(r).join(' | ')} |`)].join('\n');
}

/** Thay mục "## Token (đo thật)" (đến heading `## ` kế tiếp), hoặc nối vào cuối; tạo mới nếu chưa có file. */
export function upsertTokenSection(existing: string | undefined, table: string, summary: string): string {
  const section = `${TOKEN_HEADING}\n\n${summary}\n\n${table}\n`;
  if (existing === undefined) return `# Metric\n\n${section}`;
  const start = existing.indexOf(`${TOKEN_HEADING}\n`);
  if (start === -1) return `${existing.replace(/\s*$/, '')}\n\n${section}`;
  const rest = existing.slice(start + TOKEN_HEADING.length);
  const next = rest.search(/\n## /);
  const tail = next === -1 ? '' : `\n${rest.slice(next + 1)}`;
  return `${existing.slice(0, start)}${section}${tail}`;
}

export function writeMetric(path: string, table: string, summary: string): void {
  const existing = existsSync(path) ? readFileSync(path, 'utf8') : undefined;
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, upsertTokenSection(existing, table, summary));
}

function main(): void {
  try {
    const opts = parseArgs(process.argv.slice(2));
    const root = resolve(opts.projectDir ?? process.cwd());
    const { sessions, rows } = measure({
      baseDir: join(homedir(), '.claude', 'projects'),
      root,
      ids: opts.ids,
      since: opts.since,
      until: opts.until,
    });
    const summary = `Sessions: ${sessions.join(', ')}${opts.since ? ` · since ${opts.since}` : ''}${opts.until ? ` · until ${opts.until}` : ''}`;
    console.log(summary);
    if (opts.asMarkdown || opts.out) console.log(renderMarkdown(rows));
    else {
      const body = Object.fromEntries(rows.map((r) => [r.name, Object.fromEntries(HEADER.slice(1).map((h, i) => [h, cells(r)[i + 1]]))]));
      console.table(body);
    }
    if (opts.out) {
      writeMetric(resolve(opts.out), renderMarkdown(rows), summary);
      console.log(`Đã ghi ${opts.out}`);
    }
  } catch (e) {
    console.error((e as Error).message);
    process.exit(1);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
