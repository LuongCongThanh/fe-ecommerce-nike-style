// @vitest-environment node
import { describe, expect, it } from 'vitest';

import { evaluateHook, findDangerousGit } from './block-dangerous-git';

describe('findDangerousGit', () => {
  it.each([
    'git push',
    'git push origin chore/my-branch',
    'git push -u origin HEAD',
    'git reset --soft HEAD~1',
    'git reset HEAD file.ts',
    'git clean -n',
    'git clean -nd',
    'git branch -d merged-branch',
    'git branch -a',
    'git checkout dev',
    'git checkout -b feat/x',
    'git checkout -- src/file.ts',
    'git restore src/file.ts',
    'git restore --staged .',
    'git status && git diff',
    'echo "git push --force"',
    'grep -rn "reset --hard" docs',
    'pnpm test',
  ])('allows %s', (command) => {
    expect(findDangerousGit(command)).toBeNull();
  });

  it.each([
    ['git push --force', 'force push'],
    ['git push -f origin dev', 'force push'],
    ['git push origin dev --force-with-lease', 'force push'],
    ['git push origin +dev', 'force push'],
    ['git reset --hard', 'reset --hard'],
    ['git reset --hard origin/dev', 'reset --hard'],
    ['git clean -f', 'clean -f'],
    ['git clean -fd', 'clean -f'],
    ['git clean -xdf', 'clean -f'],
    ['git clean --force', 'clean -f'],
    ['git branch -D feature', 'branch -D'],
    ['git branch --delete --force feature', 'branch -D'],
    ['git checkout .', 'checkout .'],
    ['git checkout -- .', 'checkout .'],
    ['git restore .', 'restore .'],
    ['git restore --source=HEAD~1 .', 'restore .'],
  ])('blocks %s', (command, label) => {
    expect(findDangerousGit(command)).toContain(label);
  });

  it('catches global options before the subcommand', () => {
    expect(findDangerousGit('git -C ../wt reset --hard')).toContain('reset --hard');
    expect(findDangerousGit('git -c core.editor=true push --force')).toContain('force push');
  });

  it('catches dangerous commands chained after safe ones', () => {
    expect(findDangerousGit('git add src && git commit -m x; git reset --hard')).toContain('reset --hard');
    expect(findDangerousGit('cd wt | git clean -fd')).toContain('clean -f');
  });

  it('catches commands inside shell -c', () => {
    expect(findDangerousGit('bash -c "git push --force"')).toContain('force push');
  });

  it('ignores empty or missing commands', () => {
    expect(findDangerousGit('')).toBeNull();
  });
});

describe('commands behind prefixes and nesting', () => {
  it.each([
    ['env git reset --hard', 'reset --hard'],
    ['env GIT_TRACE=1 FOO=bar git push --force', 'force push'],
    ['env -i git clean -fd', 'clean -f'],
    ['env -u HOME git reset --hard', 'reset --hard'],
    ['GIT_TERMINAL_PROMPT=0 git push -f', 'force push'],
    ['sudo git reset --hard', 'reset --hard'],
    ['sudo -u deploy git push --force', 'force push'],
    ['command git clean -fd', 'clean -f'],
    ['nice git reset --hard', 'reset --hard'],
    ['nice -n 5 git reset --hard', 'reset --hard'],
    ['time git push --force', 'force push'],
    ['echo main | xargs git reset --hard', 'reset --hard'],
    ['xargs -n 1 git push --force', 'force push'],
    ['(git reset --hard)', 'reset --hard'],
    ['cd x && (git clean -fd; true)', 'clean -f'],
    ['echo $(git reset --hard)', 'reset --hard'],
    ['echo "$(git push --force)"', 'force push'],
    ['echo `git clean -fd`', 'clean -f'],
    ['sudo env FOO=1 bash -c "git reset --hard"', 'reset --hard'],
    ['/usr/bin/env git branch -D x', 'branch -D'],
  ])('blocks %s', (command, label) => {
    expect(findDangerousGit(command)).toContain(label);
  });

  it.each(['env FOO=1 pnpm test', 'sudo apt list', 'echo $(git status)', '(git status)', 'xargs echo hi', 'nice -n 5 pnpm lint', 'time git push'])(
    'allows %s',
    (command) => {
      expect(findDangerousGit(command)).toBeNull();
    },
  );
});

describe('unparseable commands', () => {
  it('fails closed under AGENT_RUN=1', () => {
    expect(findDangerousGit("git push 'unterminated", { failClosed: true })).toContain('unparseable');
  });
  it('fails open for humans (never wedge an interactive session)', () => {
    expect(findDangerousGit("git push 'unterminated")).toBeNull();
  });
});

describe('evaluateHook (stdin handling)', () => {
  const event = (command: unknown) => JSON.stringify({ tool_input: { command } });
  it('blocks a dangerous command with a message', () => {
    expect(evaluateHook(event('git reset --hard'), false)).toMatchObject({ block: true });
  });
  it('allows a safe command', () => {
    expect(evaluateHook(event('git status'), false)).toEqual({ block: false });
  });
  it('malformed stdin: allowed for humans, blocked under AGENT_RUN=1', () => {
    expect(evaluateHook('not json', false)).toEqual({ block: false });
    expect(evaluateHook('not json', true)).toMatchObject({ block: true });
    expect(evaluateHook(JSON.stringify({ tool_input: { command: 5 } }), true)).toMatchObject({ block: true });
  });
  it('an event without a command (other tool) is allowed', () => {
    expect(evaluateHook(JSON.stringify({ tool_input: {} }), true)).toEqual({ block: false });
  });
});
