import { existsSync, lstatSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, extname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

import * as prettier from 'prettier';

import { parseBlockedBy } from './agent-run/spec-file';
import { isTaskKind, parseFrontmatter } from './agent-run/spec';
import { TASK_DIRECTORIES } from './agent-run/tasks';

const TASK_STATUSES = new Set(['todo', 'ready-for-agent', 'in-progress', 'needs-info', 'blocked', 'ready-for-human', 'review', 'done']);
const REMOVED_DOCS = [
  'docs/FRONTEND-GUIDE.md',
  'docs/SKILL-USAGE-GUIDE.md',
  'docs/nike-ui-ux-analysis.md',
  'docs/agents/domain.md',
  'docs/agents/fashion-storefront-ui-director.md',
  'docs/plan/AGENT-SYSTEM-PLAN.md',
  'docs/plan/storefront-restructure-plan.md',
  'docs/plan/storefront-target-module-tree.md',
  'docs/plan/three-repo-restructure.md',
  'docs/storefront/plan/AGENT-SYSTEM-PLAN.md',
  'docs/storefront/plan/storefront-restructure-plan.md',
  'docs/storefront/plan/storefront-target-module-tree.md',
  'docs/storefront/plan/three-repo-restructure.md',
  'docs/reference/anthropic-academy-research.md',
] as const;
const TEXT_EXTENSIONS = new Set(['.md', '.ts', '.tsx', '.js', '.mjs', '.json', '.toml', '.css']);
const SKIP_DIRS = new Set(['.git', '.next', 'node_modules', 'coverage', 'dist', 'build']);

export interface CheckDocsOptions {
  /** Tests can isolate structural checks; the CLI always checks maintained Markdown formatting. */
  format?: boolean;
}

function filesUnder(root: string): string[] {
  const files: string[] = [];
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory() && SKIP_DIRS.has(entry.name)) continue;
      const path = join(dir, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (entry.isFile()) files.push(path);
    }
  };
  walk(root);
  return files;
}

function display(root: string, path: string): string {
  return relative(root, path).split(sep).join('/');
}

function withoutFencedCode(text: string): string {
  return text.replace(/^ {0,3}(```|~~~)[^\n]*\n[\s\S]*?^ {0,3}\1\s*$/gm, '');
}

function withoutCode(text: string): string {
  return withoutFencedCode(text).replace(/`[^`\n]*`/g, '');
}

function githubSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/[^\p{L}\p{N}\s_-]/gu, '')
    .replace(/\s+/g, '-');
}

function anchors(text: string): Set<string> {
  const found = new Set<string>();
  const counts = new Map<string, number>();
  for (const line of withoutCode(text).split(/\r?\n/)) {
    const heading = /^ {0,3}#{1,6}\s+(.+?)\s*#*\s*$/.exec(line)?.[1];
    if (!heading) continue;
    const base = githubSlug(heading);
    const count = counts.get(base) ?? 0;
    counts.set(base, count + 1);
    found.add(count === 0 ? base : `${base}-${count}`);
  }
  return found;
}

function markdownTargets(text: string): string[] {
  const clean = withoutCode(text);
  const definitions = new Map<string, string>();
  for (const match of clean.matchAll(/^\s{0,3}\[([^\]]+)\]:\s*<?([^\s>]+)>?/gm)) {
    if (match[1] && match[2]) definitions.set(match[1].trim().toLowerCase(), match[2]);
  }
  const targets: string[] = [];
  for (const match of clean.matchAll(/!?\[[^\]]*\]\(<?([^\s)>]+)>?(?:\s+['"][^)]*['"])?\)/g)) {
    if (match[1]) targets.push(match[1]);
  }
  for (const match of clean.matchAll(/(?<!!)\[([^\]]+)\]\[([^\]]*)\]/g)) {
    const key = (match[2] || match[1])?.trim().toLowerCase();
    const target = key ? definitions.get(key) : undefined;
    if (target) targets.push(target);
  }
  return targets;
}

function isExternal(target: string): boolean {
  return /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(target);
}

function isSiblingRepositoryPath(root: string, source: string, target: string): boolean {
  if (!target.startsWith('../')) return false;
  const first = target.split('/')[1];
  const resolvedTarget = resolve(dirname(source), target);
  const relativeTarget = relative(root, resolvedTarget);
  const outsideRoot = relativeTarget === '..' || relativeTarget.startsWith(`..${sep}`) || isAbsolute(relativeTarget);
  return Boolean(first && first !== '.' && outsideRoot);
}

function checkLinks(root: string, markdown: string[]): string[] {
  const problems: string[] = [];
  const anchorCache = new Map<string, Set<string>>();
  for (const source of markdown) {
    const text = readFileSync(source, 'utf8');
    for (const rawTarget of markdownTargets(text)) {
      if (isExternal(rawTarget)) continue;
      let decoded: string;
      try {
        decoded = decodeURI(rawTarget);
      } catch {
        problems.push(`${display(root, source)}: invalid URL encoding in ${rawTarget}`);
        continue;
      }
      const hash = decoded.indexOf('#');
      const pathPart = hash === -1 ? decoded : decoded.slice(0, hash);
      const fragment = hash === -1 ? '' : decodeURIComponent(decoded.slice(hash + 1)).toLowerCase();
      if (isSiblingRepositoryPath(root, source, pathPart)) continue;
      const target = pathPart === '' ? source : resolve(dirname(source), pathPart);
      if (!existsSync(target)) {
        problems.push(`${display(root, source)}: missing local link ${rawTarget}`);
        continue;
      }
      if (fragment && lstatSync(target).isFile() && extname(target).toLowerCase() === '.md') {
        let known = anchorCache.get(target);
        if (!known) {
          known = anchors(readFileSync(target, 'utf8'));
          anchorCache.set(target, known);
        }
        if (!known.has(fragment)) problems.push(`${display(root, source)}: missing anchor #${fragment} in ${display(root, target)}`);
      }
    }
  }
  return problems;
}

function checkTasks(root: string): string[] {
  const problems: string[] = [];
  const records = new Map<string, { blockers: string[]; text: string; spec: string }>();
  for (const directory of TASK_DIRECTORIES) {
    const base = join(root, directory);
    if (!existsSync(base)) continue;
    for (const entry of readdirSync(base, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const spec = join(base, entry.name, 'spec.md');
      if (!existsSync(spec)) continue;
      const text = readFileSync(spec, 'utf8');
      const fm = parseFrontmatter(text);
      if (!TASK_STATUSES.has(fm.status ?? '')) problems.push(`${display(root, spec)}: invalid status ${fm.status ?? '(missing)'}`);
      if (!isTaskKind(fm.kind)) problems.push(`${display(root, spec)}: invalid kind ${fm.kind ?? '(missing)'}`);
      const expected = /^(\d+)/.exec(entry.name)?.[1];
      const headingIdentity = /^# Spec\s+(\d+)\b/m.exec(text)?.[1];
      if (expected && headingIdentity && headingIdentity !== expected) {
        problems.push(`${display(root, spec)}: task heading identity ${headingIdentity} does not match ${expected}`);
      }
      if (records.has(entry.name)) problems.push(`${display(root, spec)}: duplicate task identity ${entry.name}`);
      records.set(entry.name, { blockers: parseBlockedBy(text), text, spec: display(root, spec) });
    }
  }
  for (const record of records.values()) {
    for (const blocker of record.blockers) {
      if (!records.has(blocker)) problems.push(`${record.spec}: unknown blocker ${blocker}`);
    }
    const parent = /^Part of\s+([\w-]+)\s*$/im.exec(record.text)?.[1];
    if (parent && !records.has(parent)) problems.push(`${record.spec}: unknown Wayfinder parent ${parent}`);
  }
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (name: string, path: string[]): void => {
    if (visiting.has(name)) {
      problems.push(`${records.get(name)?.spec}: blocker cycle ${[...path, name].join(' -> ')}`);
      return;
    }
    if (visited.has(name)) return;
    visiting.add(name);
    for (const blocker of records.get(name)?.blockers ?? []) if (records.has(blocker)) visit(blocker, [...path, name]);
    visiting.delete(name);
    visited.add(name);
  };
  for (const name of records.keys()) visit(name, []);
  return problems;
}

function checkRemovedConsumers(root: string, files: string[]): string[] {
  const problems: string[] = [];
  for (const file of files) {
    const name = display(root, file);
    if (TASK_DIRECTORIES.some((directory) => name.startsWith(`${directory}/`))) continue;
    if (name === 'scripts/check-docs.ts' || name === 'scripts/check-docs.test.ts') continue;
    if (!TEXT_EXTENSIONS.has(extname(file))) continue;
    const text = withoutFencedCode(readFileSync(file, 'utf8'));
    for (const removed of REMOVED_DOCS) {
      if (text.includes(removed)) problems.push(`${name}: live consumer references removed document ${removed}`);
    }
  }
  return problems;
}

function isMaintainedMarkdown(root: string, file: string): boolean {
  const name = display(root, file);
  if (extname(file) !== '.md' || TASK_DIRECTORIES.some((directory) => name.startsWith(`${directory}/`))) return false;
  if (!name.startsWith('.')) return !name.startsWith('agent/');
  if (name.startsWith('.claude/agents/') || name.startsWith('.claude/commands/') || name.startsWith('.claude/rules/')) return true;
  if (name.startsWith('.codex/agents/')) return true;
  return /\.agents\/skills\/(?:fashion-storefront-ui-director|plan-task|storefront-workflow)\/SKILL\.md$/.test(name);
}

function isCheckedMarkdown(root: string, file: string): boolean {
  const name = display(root, file);
  if (extname(file) !== '.md') return false;
  if (name.startsWith('docs/')) return true;
  if (!name.includes('/')) return true;
  return isMaintainedMarkdown(root, file);
}

async function checkFormatting(root: string, files: string[]): Promise<string[]> {
  const problems: string[] = [];
  for (const file of files.filter((candidate) => isMaintainedMarkdown(root, candidate))) {
    const config = await prettier.resolveConfig(file);
    if (!(await prettier.check(readFileSync(file, 'utf8'), { ...config, filepath: file })))
      problems.push(`${display(root, file)}: not formatted by Prettier`);
  }
  return problems;
}

export async function checkDocs(root: string, options: CheckDocsOptions = {}): Promise<string[]> {
  const absoluteRoot = resolve(root);
  const files = filesUnder(absoluteRoot);
  const markdown = files.filter((file) => isCheckedMarkdown(absoluteRoot, file));
  return [
    ...(options.format === false ? [] : await checkFormatting(absoluteRoot, files)),
    ...checkLinks(absoluteRoot, markdown),
    ...checkTasks(absoluteRoot),
    ...checkRemovedConsumers(absoluteRoot, files),
  ];
}

async function main(): Promise<void> {
  const root = resolve(process.argv[2] ?? process.cwd());
  const problems = await checkDocs(root);
  if (problems.length > 0) {
    process.stderr.write(`Documentation checks failed (${problems.length}):\n${problems.map((problem) => `- ${problem}`).join('\n')}\n`);
    process.exitCode = 1;
    return;
  }
  process.stdout.write('Documentation checks passed.\n');
}

if (isAbsolute(process.argv[1] ?? '') && import.meta.url === pathToFileURL(process.argv[1] ?? '').href) void main();
