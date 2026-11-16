// @vitest-environment node
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { decide, type GuardConfig, type GuardContext, type HookInput } from './guard';

const config = JSON.parse(readFileSync(resolve(__dirname, '../../agent-guard.json'), 'utf8')) as GuardConfig;
const ROOT = '/work/wt/feat-x';
const TASK = 'docs/plan/tasks/03-card';

const ctx = (over: Partial<GuardContext> = {}): GuardContext => ({
  config,
  agentRun: true,
  phase: 'implement',
  taskDir: TASK,
  approved: { paths: [], commands: [] },
  projectRoot: ROOT,
  stopFileExists: false,
  ...over,
});
const human = ctx({ agentRun: false, phase: undefined, taskDir: undefined });

const tool = (tool_name: string, tool_input: Record<string, unknown>): HookInput => ({ tool_name, tool_input, cwd: ROOT });
const file = (name: string, p: string) => tool(name, { file_path: p });
const bash = (command: string) => tool('Bash', { command });

type Row = [label: string, input: HookInput, context: GuardContext, expected: 'allow' | string];

const rows: Row[] = [
  // --- always on: secrets (even for humans) ---
  ['read .env.local', file('Read', `${ROOT}/.env.local`), human, 'secret'],
  ['read .env', file('Read', `${ROOT}/.env`), human, 'secret'],
  ['read nested .env.production', file('Read', `${ROOT}/apps/x/.env.production`), human, 'secret'],
  ['read .env.example is fine', file('Read', `${ROOT}/.env.example`), human, 'allow'],
  ['edit .env.local', file('Edit', `${ROOT}/.env.local`), human, 'secret'],
  ['write .env via relative path with ..', file('Write', `${ROOT}/src/../.env`), human, 'secret'],
  ['cat .env.local', bash('cat .env.local'), human, 'secret'],
  ['cat quoted path', bash('cat "./.env.local"'), human, 'secret'],
  ['cat .env.example fine', bash('cat .env.example'), human, 'allow'],
  ['grep with env file arg', bash('grep KEY .env.production'), human, 'secret'],
  ['node --env-file', bash('node --env-file=.env.local x.js'), human, 'secret'],
  ['cat glob .env*', bash('cat .env*'), human, 'secret'],
  ['process.env mention is not a file', bash('echo process.env.FOO'), human, 'allow'],
  ['Glob pattern for env files', tool('Glob', { pattern: '**/.env*' }), human, 'secret'],
  ['Grep path at env file', tool('Grep', { pattern: 'KEY', path: `${ROOT}/.env.local` }), human, 'secret'],
  ['Grep glob for env files', tool('Grep', { pattern: 'KEY', glob: '.env*' }), human, 'secret'],
  ['Grep for code is fine', tool('Grep', { pattern: 'process.env', path: `${ROOT}/src` }), human, 'allow'],
  // --- always on: .agent-stop ---
  ['read .agent-stop', file('Read', `${ROOT}/.agent-stop`), human, 'stop-file'],
  ['write .agent-stop', file('Write', `${ROOT}/.agent-stop`), human, 'stop-file'],
  ['rm .agent-stop via bash (human)', bash('rm .agent-stop'), human, 'stop-file'],
  ['touch .agent-stop in main root', file('Write', '/work/main/.agent-stop'), human, 'stop-file'],
  // --- emergency stop ---
  ['emergency stop blocks read', file('Read', `${ROOT}/src/a.ts`), ctx({ stopFileExists: true }), 'emergency-stop'],
  ['emergency stop blocks bash', bash('pnpm test'), ctx({ stopFileExists: true }), 'emergency-stop'],
  ['stop file ignored for humans', file('Read', `${ROOT}/src/a.ts`), { ...human, stopFileExists: true }, 'allow'],
  // --- humans are otherwise unrestricted ---
  ['human edits .claude', file('Edit', `${ROOT}/.claude/settings.json`), human, 'allow'],
  ['human runs git commit', bash('git commit -m x'), human, 'allow'],
  ['human rm -rf', bash('rm -rf node_modules'), human, 'allow'],
  // --- AGENT_RUN: write deny list (one row per table group) ---
  ['generated api', file('Edit', `${ROOT}/src/lib/api/generated/x.ts`), ctx(), 'deny-path'],
  ['lockfile', file('Write', `${ROOT}/pnpm-lock.yaml`), ctx(), 'deny-path'],
  ['skills-lock', file('Write', `${ROOT}/skills-lock.json`), ctx(), 'deny-path'],
  ['agent settings', file('Edit', `${ROOT}/.claude/settings.json`), ctx(), 'deny-path'],
  ['agent hooks', file('Edit', `${ROOT}/.claude/hooks/agent-guard.ts`), ctx(), 'deny-path'],
  ['agent-guard.json', file('Edit', `${ROOT}/.claude/agent-guard.json`), ctx(), 'deny-path'],
  ['agent skills', file('Write', `${ROOT}/.claude/skills/x/SKILL.md`), ctx(), 'deny-path'],
  ['.mcp.json', file('Edit', `${ROOT}/.mcp.json`), ctx(), 'deny-path'],
  ['scripts', file('Edit', `${ROOT}/scripts/agent-run/state.ts`), ctx(), 'deny-path'],
  ['inbox', file('Write', `${ROOT}/docs/plan/AGENT-INBOX.md`), ctx(), 'deny-path'],
  ['.agent-run state', file('Write', `${ROOT}/.agent-run/state.json`), ctx(), 'deny-path'],
  ['husky', file('Edit', `${ROOT}/.husky/pre-commit`), ctx(), 'deny-path'],
  ['commitlint', file('Edit', `${ROOT}/commitlint.config.mjs`), ctx(), 'deny-path'],
  ['lint-staged', file('Edit', `${ROOT}/lint-staged.config.mjs`), ctx(), 'deny-path'],
  ['eslint config', file('Edit', `${ROOT}/eslint.config.mjs`), ctx(), 'deny-path'],
  ['prettierrc', file('Edit', `${ROOT}/.prettierrc.mjs`), ctx(), 'deny-path'],
  ['prettierignore', file('Edit', `${ROOT}/.prettierignore`), ctx(), 'deny-path'],
  ['tsconfig', file('Edit', `${ROOT}/tsconfig.json`), ctx(), 'deny-path'],
  ['vitest config', file('Edit', `${ROOT}/vitest.config.ts`), ctx(), 'deny-path'],
  ['playwright config', file('Edit', `${ROOT}/playwright.config.ts`), ctx(), 'deny-path'],
  ['workflows', file('Edit', `${ROOT}/.github/workflows/ci.yml`), ctx(), 'deny-path'],
  ['PR template', file('Edit', `${ROOT}/.github/PULL_REQUEST_TEMPLATE.md`), ctx(), 'deny-path'],
  ['adr', file('Write', `${ROOT}/docs/adr/0001-x.md`), ctx(), 'deny-path'],
  ['AGENTS.md', file('Edit', `${ROOT}/AGENTS.md`), ctx(), 'deny-path'],
  ['CLAUDE.md', file('Edit', `${ROOT}/CLAUDE.md`), ctx(), 'deny-path'],
  ['legacy apps', file('Edit', `${ROOT}/apps/web/x.ts`), ctx(), 'deny-path'],
  ['MultiEdit on denied path', file('MultiEdit', `${ROOT}/CLAUDE.md`), ctx(), 'deny-path'],
  ['NotebookEdit on denied path', tool('NotebookEdit', { notebook_path: `${ROOT}/apps/n.ipynb` }), ctx(), 'deny-path'],
  ['relative path into denied dir', tool('Edit', { file_path: 'src/../.claude/settings.json' }), ctx(), 'deny-path'],
  ['denied path via ../ traversal', file('Edit', `${ROOT}/src/../../feat-x/CLAUDE.md`), ctx(), 'deny-path'],
  // --- AGENT_RUN: ask paths ---
  ['package.json', file('Edit', `${ROOT}/package.json`), ctx(), 'ask-path'],
  ['next config', file('Edit', `${ROOT}/next.config.ts`), ctx(), 'ask-path'],
  ['middleware', file('Edit', `${ROOT}/src/middleware.ts`), ctx(), 'ask-path'],
  ['gitignore', file('Edit', `${ROOT}/.gitignore`), ctx(), 'ask-path'],
  // --- AGENT_RUN: allowed writes ---
  ['source file', file('Edit', `${ROOT}/src/features/cart/Cart.tsx`), ctx(), 'allow'],
  ['new test', file('Write', `${ROOT}/src/features/cart/Cart.test.tsx`), ctx(), 'allow'],
  ['nested package.json lookalike', file('Write', `${ROOT}/src/package.json`), ctx(), 'allow'],
  ['write outside worktree', file('Write', '/etc/passwd'), ctx(), 'outside-root'],
  ['write to main checkout', file('Write', '/work/main/src/a.ts'), ctx(), 'outside-root'],
  ['reads are not restricted', file('Read', `${ROOT}/.claude/settings.json`), ctx(), 'allow'],
  ['read outside worktree', file('Read', '/work/main/src/a.ts'), ctx(), 'allow'],
  // --- approvals ---
  ['approved ask path', file('Edit', `${ROOT}/package.json`), ctx({ approved: { paths: ['package.json'], commands: [] } }), 'allow'],
  ['approved deny path glob', file('Edit', `${ROOT}/apps/web/x.ts`), ctx({ approved: { paths: ['apps/web/**'], commands: [] } }), 'allow'],
  ['approval does not widen', file('Edit', `${ROOT}/CLAUDE.md`), ctx({ approved: { paths: ['package.json'], commands: [] } }), 'deny-path'],
  ['approval never unlocks secrets', file('Edit', `${ROOT}/.env.local`), ctx({ approved: { paths: ['.env.local'], commands: [] } }), 'secret'],
  ['approved command', bash('pnpm add zod'), ctx({ approved: { paths: [], commands: ['pnpm add zod'] } }), 'allow'],
  ['approved command is exact', bash('pnpm add evil'), ctx({ approved: { paths: [], commands: ['pnpm add zod'] } }), 'command'],
  [
    'approved command in compound still checks rest',
    bash('pnpm add zod && rm -rf x'),
    ctx({ approved: { paths: [], commands: ['pnpm add zod'] } }),
    'command',
  ],
  // --- phase exceptions ---
  ['planner writes its plan.md', file('Write', `${ROOT}/${TASK}/plan.md`), ctx({ phase: 'plan' }), 'allow'],
  ['planner cannot write src', file('Write', `${ROOT}/src/a.ts`), ctx({ phase: 'plan' }), 'phase'],
  ['planner cannot write other task plan', file('Write', `${ROOT}/docs/plan/tasks/04-x/plan.md`), ctx({ phase: 'plan' }), 'phase'],
  ['planner cannot write spec.md', file('Write', `${ROOT}/${TASK}/spec.md`), ctx({ phase: 'plan' }), 'phase'],
  ['planner cannot write report.md', file('Write', `${ROOT}/${TASK}/report.md`), ctx({ phase: 'plan' }), 'phase'],
  ['planner has no bash', bash('pnpm test'), ctx({ phase: 'plan' }), 'command'],
  [
    'planner cannot be approved into src',
    file('Write', `${ROOT}/src/a.ts`),
    ctx({ phase: 'plan', approved: { paths: ['src/**'], commands: [] } }),
    'phase',
  ],
  ['planner without task dir', file('Write', `${ROOT}/${TASK}/plan.md`), ctx({ phase: 'plan', taskDir: undefined }), 'phase'],
  ['planner absolute task dir', file('Write', `${ROOT}/${TASK}/plan.md`), ctx({ phase: 'plan', taskDir: `${ROOT}/${TASK}/` }), 'allow'],
  ['implementer writes report.md', file('Write', `${ROOT}/${TASK}/report.md`), ctx({ phase: 'implement' }), 'allow'],
  ['retro appends report.md', file('Edit', `${ROOT}/${TASK}/report.md`), ctx({ phase: 'retro' }), 'allow'],
  ['unset phase defaults to implement', file('Edit', `${ROOT}/src/a.ts`), ctx({ phase: undefined }), 'allow'],
  ['unknown phase fails closed', file('Edit', `${ROOT}/src/a.ts`), ctx({ phase: 'weird' }), 'phase'],
  ['reviewer cannot write', file('Write', `${ROOT}/src/a.ts`), ctx({ phase: 'review' }), 'phase'],
  ['reviewer git diff', bash('git diff origin/dev...HEAD'), ctx({ phase: 'review' }), 'allow'],
  ['reviewer git log', bash('git log --oneline -5'), ctx({ phase: 'review' }), 'allow'],
  ['reviewer git commit', bash('git commit -m x'), ctx({ phase: 'review' }), 'command'],
  ['reviewer git diff --output', bash('git diff --output=x.txt'), ctx({ phase: 'review' }), 'command'],
  ['reviewer cannot run pnpm test', bash('pnpm test'), ctx({ phase: 'review' }), 'command'],
  // --- Bash allow list ---
  ...[
    'pnpm typecheck',
    'pnpm lint',
    'pnpm lint:fix',
    'pnpm format',
    'pnpm test',
    'pnpm build',
    'pnpm exec vitest run src/a.test.ts',
    'pnpm exec vitest run',
    'pnpm exec eslint src/a.ts --fix',
    '  pnpm   test  ',
    'pnpm test 2>&1',
    'pnpm test > /dev/null',
    'pnpm lint && pnpm typecheck',
    'pnpm lint ; pnpm test',
    'pnpm lint || pnpm lint:fix',
    'pnpm exec vitest run -t "a && b"',
    "pnpm exec vitest run -t 'x; echo hi'",
    'pnpm exec vitest run src/a.test.ts 2>&1 >/dev/null',
    'pnpm lint\npnpm typecheck',
  ].map((c): Row => [`allowed: ${c.replace('\n', '\\n')}`, bash(c), ctx(), 'allow']),
  ...[
    'pnpm add zod',
    'pnpm install',
    'pnpm i',
    'pnpm remove react',
    'pnpm dlx foo',
    'pnpm exec tsx x.ts',
    'pnpm exec node -e 1',
    'pnpm dev',
    'pnpm test src/a.test.ts',
    'pnpm lint --fix',
    'pnpm run lint',
    'npx foo',
    'npm i',
    'node -e "1"',
    'node x.js',
    'git add .',
    'git commit -m x',
    'git push',
    'git reset --hard',
    'curl http://x',
    'FOO=1 pnpm test',
    'env pnpm test',
    'sudo pnpm test',
    'bash -c "pnpm test"',
    'sh -c pnpm',
    'xargs pnpm test',
  ].map((c): Row => [`denied: ${c}`, bash(c), ctx(), 'command']),
  // --- compound / bypass attempts ---
  ['and-chain with denied tail', bash('pnpm test && git push'), ctx(), 'command'],
  ['and-chain with denied head', bash('git push && pnpm test'), ctx(), 'command'],
  ['semicolon', bash('pnpm test; git add -A'), ctx(), 'command'],
  ['or', bash('pnpm test || git commit -m x'), ctx(), 'command'],
  ['pipe to disallowed', bash('pnpm test | tee out.txt'), ctx(), 'command'],
  ['pipe from disallowed', bash('curl a | pnpm test'), ctx(), 'command'],
  ['background &', bash('pnpm test & git push'), ctx(), 'command'],
  ['newline separator', bash('pnpm test\ngit push'), ctx(), 'command'],
  ['command substitution $()', bash('pnpm exec vitest run $(git push)'), ctx(), 'command'],
  ['command substitution in dquotes', bash('pnpm exec vitest run "$(git push)"'), ctx(), 'command'],
  ['backticks', bash('pnpm exec vitest run `git push`'), ctx(), 'command'],
  ['backticks in dquotes', bash('pnpm exec vitest run "`git push`"'), ctx(), 'command'],
  ['subshell', bash('(git push)'), ctx(), 'command'],
  ['subshell after allowed', bash('pnpm test && (git push)'), ctx(), 'command'],
  ['process substitution', bash('pnpm exec eslint <(git push)'), ctx(), 'command'],
  ['heredoc', bash('pnpm exec vitest run <<EOF\nx\nEOF'), ctx(), 'command'],
  ['brace group', bash('{ git push; }'), ctx(), 'command'],
  ['rm -rf', bash('rm -rf src'), ctx(), 'command'],
  ['rm -r -f', bash('rm -r -f src'), ctx(), 'command'],
  ['rm -rf inside quotes is still refused (coarse secondary layer)', bash("pnpm exec vitest run -t 'rm -rf'"), ctx(), 'command'],
  ['rm -fr', bash('rm -fr /'), ctx(), 'command'],
  ['rm after allowed', bash('pnpm test && rm -rf .'), ctx(), 'command'],
  ['find -delete', bash('find . -name x -delete'), ctx(), 'command'],
  ['redirect write into denied path', bash('pnpm test > .claude/settings.json'), ctx(), 'deny-path'],
  ['append to denied path', bash('pnpm test >> CLAUDE.md'), ctx(), 'deny-path'],
  ['stderr redirect to denied path', bash('pnpm test 2> scripts/x.ts'), ctx(), 'deny-path'],
  ['&> redirect to denied path', bash('pnpm test &> .husky/pre-commit'), ctx(), 'deny-path'],
  ['redirect without space', bash('pnpm test >package.json'), ctx(), 'ask-path'],
  ['redirect to ask path', bash('pnpm test > package.json'), ctx(), 'ask-path'],
  ['redirect to dynamic target', bash('pnpm test > $OUT'), ctx(), 'command'],
  ['redirect to glob target', bash('pnpm test > out*'), ctx(), 'command'],
  ['redirect to secret', bash('pnpm test > .env.local'), ctx(), 'secret'],
  ['redirect outside worktree', bash('pnpm test > /tmp/x'), ctx(), 'outside-root'],
  ['redirect into src is fine', bash('pnpm test > src/out.txt'), ctx(), 'allow'],
  ['redirect without target', bash('pnpm test >'), ctx(), 'command'],
  ['unterminated quote', bash('pnpm test "'), ctx(), 'command'],
  ['escaped separators do not split', bash('pnpm exec vitest run a\\;b'), ctx(), 'allow'],
  ['escaped space joins a word', bash('pnpm\\ test'), ctx(), 'command'],
  ['quoted command word is unquoted for matching', bash('"pnpm" "test"'), ctx(), 'allow'],
  ['reading secrets via allowed cmd args', bash('pnpm exec eslint .env.local'), ctx(), 'secret'],
  // --- output filters after an allowed command ---
  ['filter tail -15', bash('pnpm typecheck 2>&1 | tail -15'), ctx(), 'allow'],
  ['vitest with 2>&1 and tail', bash('pnpm exec vitest run src/x.test.ts 2>&1 | tail -15'), ctx(), 'allow'],
  ['filter tail -n 20', bash('pnpm test | tail -n 20'), ctx(), 'allow'],
  ['filter tail -n20', bash('pnpm test | tail -n20'), ctx(), 'allow'],
  ['filter head -5', bash('pnpm lint | head -5'), ctx(), 'allow'],
  ['filter bare tail', bash('pnpm lint | tail'), ctx(), 'allow'],
  ['filter grep pattern', bash('pnpm test 2>&1 | grep FAIL'), ctx(), 'allow'],
  ['filter grep -i -E pattern', bash('pnpm test | grep -iE "fail|error"'), ctx(), 'allow'],
  ['filter wc -l', bash('pnpm lint | wc -l'), ctx(), 'allow'],
  ['chained filters', bash('pnpm test 2>&1 | grep -v ok | tail -20'), ctx(), 'allow'],
  ['2>&1 alone', bash('pnpm test 2>&1'), ctx(), 'allow'],
  ['filter after cd &&', bash('cd docs && pnpm test | tail -5'), ctx(), 'allow'],
  ['filter alone is denied', bash('tail -15'), ctx(), 'command'],
  ['filter alone after && is denied', bash('pnpm test && tail -15'), ctx(), 'command'],
  ['filter before an allowed command is denied', bash('tail -5 | pnpm test'), ctx(), 'command'],
  ['unallowed command piped to filter', bash('pnpm add x | tail'), ctx(), 'command'],
  ['rm piped to filter', bash('rm -rf x | tail'), ctx(), 'command'],
  ['git push piped to filter', bash('git push | tail'), ctx(), 'command'],
  ['filter after && is not a pipe', bash('pnpm test && head -3'), ctx(), 'command'],
  ['tail with a file arg', bash('pnpm test | tail -5 src/a.ts'), ctx(), 'command'],
  ['tail -f', bash('pnpm test | tail -f'), ctx(), 'command'],
  ['head with weird flag', bash('pnpm test | head --lines=x'), ctx(), 'command'],
  ['grep with a file arg', bash('pnpm test | grep FAIL src/a.ts'), ctx(), 'command'],
  ['grep -r', bash('pnpm test | grep -r FAIL'), ctx(), 'command'],
  ['grep -f patterns file', bash('pnpm test | grep -f pats'), ctx(), 'command'],
  ['grep without pattern', bash('pnpm test | grep'), ctx(), 'command'],
  ['wc -c', bash('pnpm test | wc -c'), ctx(), 'command'],
  ['wc with a file', bash('pnpm test | wc -l a.txt'), ctx(), 'command'],
  ['filter redirecting to a file', bash('pnpm test | tail > src/o.txt'), ctx(), 'command'],
  ['filter then unallowed command', bash('pnpm test | tail -3 | sh'), ctx(), 'command'],
  ['planner: no filters either', bash('pnpm test | tail'), ctx({ phase: 'plan' }), 'command'],
  // --- read-only commands ---
  ['cat spec and plan', bash('cat docs/plan/tasks/03-x/spec.md docs/plan/tasks/03-x/plan.md'), ctx(), 'allow'],
  ['cat template; echo; cat', bash('cat .github/PULL_REQUEST_TEMPLATE.md; echo ----; cat docs/plan/tasks/03-x/report.md'), ctx(), 'allow'],
  ['cd task dir && cat', bash('cd docs/plan/tasks/03-x && cat spec.md plan.md'), ctx(), 'allow'],
  ['cd with absolute path inside worktree', bash(`cd ${ROOT}/docs && cat a.md`), ctx(), 'allow'],
  ['ls', bash('ls -la src/components'), ctx(), 'allow'],
  ['echo', bash('echo hello'), ctx(), 'allow'],
  ['git rev-parse + log + diff stat', bash('git rev-parse dev && git log dev..HEAD --oneline && git diff dev...HEAD --stat'), ctx(), 'allow'],
  ['git status', bash('git status --short'), ctx(), 'allow'],
  ['git show', bash('git show HEAD~1 --stat'), ctx(), 'allow'],
  ['git diff with pathspec', bash('git diff dev...HEAD -- src/a.ts'), ctx(), 'allow'],
  ['git diff piped to head', bash('git diff dev...HEAD | head -50'), ctx(), 'allow'],
  ['reviewer cat', bash('cat docs/plan/tasks/03-x/spec.md'), ctx({ phase: 'review' }), 'allow'],
  ['reviewer git status', bash('git status'), ctx({ phase: 'review' }), 'allow'],
  ['reviewer git rev-parse', bash('git rev-parse dev'), ctx({ phase: 'review' }), 'allow'],
  ['reviewer ls', bash('ls src'), ctx({ phase: 'review' }), 'allow'],
  ['retro cat', bash('cat docs/plan/tasks/03-x/report.md'), ctx({ phase: 'retro' }), 'allow'],
  ['reviewer cannot run pnpm', bash('pnpm typecheck'), ctx({ phase: 'review' }), 'command'],
  ['planner has no cat', bash('cat spec.md'), ctx({ phase: 'plan' }), 'command'],
  ['planner has no git status', bash('git status'), ctx({ phase: 'plan' }), 'command'],
  ['planner has no cd', bash('cd docs'), ctx({ phase: 'plan' }), 'command'],
  ['cat .env.local stays denied', bash('cat .env.local'), ctx(), 'secret'],
  ['cat .env in a later segment', bash('echo hi; cat .env'), ctx(), 'secret'],
  ['cat nested .env.production', bash('cat apps/x/.env.production'), ctx(), 'secret'],
  ['cat .env.example is fine', bash('cat .env.example'), ctx(), 'allow'],
  ['cat .agent-stop', bash('cat .agent-stop'), ctx(), 'stop-file'],
  ['cd then cat .env', bash('cd docs && cat ../.env.local'), ctx(), 'secret'],
  ['cat outside worktree', bash('cat /etc/passwd'), ctx(), 'command'],
  ['cat parent dir', bash('cat ../../other/file'), ctx(), 'command'],
  ['cat home dir', bash('cat ~/.ssh/id_rsa'), ctx(), 'command'],
  ['cat with variable', bash('cat $FILE'), ctx(), 'command'],
  ['cat with glob', bash('cat .e*'), ctx(), 'command'],
  ['ls with glob', bash('ls src/*'), ctx(), 'command'],
  ['cd outside worktree', bash('cd /tmp && cat x'), ctx(), 'command'],
  ['cd .. out of worktree', bash('cd .. && cat x'), ctx(), 'command'],
  ['cd then relative escape', bash('cd docs && cat ../../x'), ctx(), 'command'],
  ['cd with no argument', bash('cd && cat x'), ctx(), 'command'],
  ['cat > file', bash('cat a.md > src/b.md'), ctx(), 'command'],
  ['echo > file', bash('echo hi > src/b.md'), ctx(), 'command'],
  ['echo >> report', bash(`echo hi >> ${TASK}/report.md`), ctx(), 'command'],
  ['echo with substitution', bash('echo $(cat x)'), ctx(), 'command'],
  ['git push stays denied', bash('git push'), ctx(), 'command'],
  ['git commit stays denied', bash('git commit -m x'), ctx(), 'command'],
  ['git diff --output stays denied', bash('git diff --output=x.txt'), ctx(), 'command'],
  ['git -c config trick', bash('git -c core.pager=sh log'), ctx(), 'command'],
  ['git diff --no-index outside', bash('git diff --no-index /etc/passwd x'), ctx(), 'command'],
  ['git log with abs path outside', bash('git log -- /etc/passwd'), ctx(), 'command'],
  ['git checkout stays denied', bash('git checkout dev'), ctx(), 'command'],
];

describe('decide()', () => {
  it.each(rows)('%s', (_label, input, context, expected) => {
    const d = decide(input, context);
    if (expected === 'allow') {
      expect(d).toEqual({ allow: true });
    } else {
      expect(d.allow).toBe(false);
      if (!d.allow) expect(d.kind).toBe(expected);
    }
  });

  it('tells the agent to return blocked + needs_approval for protected paths and commands', () => {
    for (const input of [file('Edit', `${ROOT}/package.json`), file('Edit', `${ROOT}/CLAUDE.md`), bash('git push')]) {
      const d = decide(input, ctx());
      expect(d.allow).toBe(false);
      if (!d.allow) {
        expect(d.reason).toContain('blocked');
        expect(d.reason).toContain('needs_approval');
      }
    }
  });

  it('tells the agent to run the allowed command on its own when a denied command contains one', () => {
    for (const command of ['pnpm typecheck 2>&1 | sh', 'pnpm typecheck && git push', 'pnpm exec vitest run a.test.ts | tail -f']) {
      const d = decide(bash(command), ctx());
      expect(d.allow).toBe(false);
      if (!d.allow) {
        expect(d.reason).toContain('run the allowed command on its own');
        expect(d.reason).not.toContain('needs_approval');
      }
    }
    const d = decide(bash('pnpm typecheck && git push'), ctx());
    expect(!d.allow && d.reason).toContain('`pnpm typecheck`');
  });

  it('keeps needs_approval for commands with nothing allowed in them', () => {
    for (const command of ['git push', 'pnpm add x | tail', 'rm -rf x | tail', 'tail -15']) {
      const d = decide(bash(command), ctx());
      expect(d.allow).toBe(false);
      if (!d.allow) {
        expect(d.reason).toContain('needs_approval');
        expect(d.reason).not.toContain('on its own');
      }
    }
  });

  it('reports a stable target: relative path for files, full command for bash', () => {
    const f = decide(file('Edit', `${ROOT}/src/../CLAUDE.md`), ctx());
    const b = decide(bash('git  push'), ctx());
    expect(f.allow === false && f.target).toBe('CLAUDE.md');
    expect(b.allow === false && b.target).toBe('git  push');
  });

  it('resolves relative paths against the hook cwd', () => {
    expect(decide({ tool_name: 'Edit', tool_input: { file_path: 'CLAUDE.md' }, cwd: `${ROOT}/src` }, ctx()).allow).toBe(true);
    expect(decide({ tool_name: 'Edit', tool_input: { file_path: '../CLAUDE.md' }, cwd: `${ROOT}/src` }, ctx()).allow).toBe(false);
    expect(decide({ tool_name: 'Edit', tool_input: { file_path: 'CLAUDE.md' }, cwd: ROOT }, ctx()).allow).toBe(false);
  });

  it('allows tools it does not know about and malformed non-file input for humans', () => {
    expect(decide(tool('WebFetch', { url: 'x' }), ctx())).toEqual({ allow: true });
    expect(decide(tool('Bash', {}), human)).toEqual({ allow: true });
  });

  it('denies malformed input under AGENT_RUN (fail closed)', () => {
    const d = decide(tool('Edit', {}), ctx());
    expect(d.allow).toBe(false);
    expect(decide(tool('Bash', {}), ctx()).allow).toBe(false);
  });
});
