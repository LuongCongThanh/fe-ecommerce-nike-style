// @vitest-environment node
import { describe, expect, it } from 'vitest';

import { fallbackCommitMessage, hasForbiddenWord, pickCommitMessage, validateCommitMessage } from './text-rules';

describe('hasForbiddenWord (mirrors .husky/commit-msg + pr-title-lint)', () => {
  it.each(['Claude did it', 'see .claude/hooks', 'CLAUDE.md', 'uses OpenAI', 'Co-Authored-By: Some Bot <x@y>', 'cursor rules', 'llama'])(
    '%s',
    (s) => {
      expect(hasForbiddenWord(s)).toBe(true);
    },
  );
  it('allows normal text', () => expect(hasForbiddenWord('feat(cart): add quantity stepper')).toBe(false));
});

describe('validateCommitMessage (commitlint config-conventional)', () => {
  it('accepts a conventional message with a short body', () => {
    expect(validateCommitMessage('feat(cart): add stepper\n\nBody line.')).toEqual([]);
  });
  it('rejects non conventional header', () => expect(validateCommitMessage('added stuff')).not.toEqual([]));
  it('rejects unknown type', () => expect(validateCommitMessage('wip: x')).not.toEqual([]));
  it('rejects header over 100 chars', () => expect(validateCommitMessage(`feat: ${'a'.repeat(100)}`)).not.toEqual([]));
  it('rejects body line over 100 chars', () => expect(validateCommitMessage(`feat: x\n\n${'b'.repeat(101)}`)).not.toEqual([]));
  it('requires blank line before body', () => expect(validateCommitMessage('feat: x\nbody')).not.toEqual([]));
  it('rejects capitalised subject and trailing period', () => {
    expect(validateCommitMessage('feat: Add x')).not.toEqual([]);
    expect(validateCommitMessage('feat: add x.')).not.toEqual([]);
  });
  it('rejects forbidden words', () => expect(validateCommitMessage('feat: add claude hook')).not.toEqual([]));
});

describe('commit message choice', () => {
  const opts = { kind: 'ui' as const, taskName: '03-product-card', title: 'Product card: Add wishlist' };
  it('keeps a valid agent message (trimmed)', () => {
    expect(pickCommitMessage('  feat(card): add wishlist  \n', opts)).toBe('feat(card): add wishlist');
  });
  it('falls back when invalid or missing', () => {
    expect(pickCommitMessage(undefined, opts)).toBe(fallbackCommitMessage(opts));
    expect(pickCommitMessage('Fix: Stuff.', opts)).toBe(fallbackCommitMessage(opts));
  });
  it('fallback is valid and safe', () => {
    expect(validateCommitMessage(fallbackCommitMessage(opts))).toEqual([]);
    expect(fallbackCommitMessage(opts)).toBe('feat: complete task 03 product card');
    expect(validateCommitMessage(fallbackCommitMessage({ kind: 'docs', taskName: '09-claude-notes', title: '' }))).toEqual([]);
    expect(fallbackCommitMessage({ kind: 'refactor', taskName: '04-x', title: '' })).toMatch(/^refactor: /);
  });
});
