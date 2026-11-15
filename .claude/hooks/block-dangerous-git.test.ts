// @vitest-environment node
import { describe, expect, it } from 'vitest';

import { findDangerousGit } from './block-dangerous-git';

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
