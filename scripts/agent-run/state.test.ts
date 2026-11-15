// @vitest-environment node
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { countBlocks, findRepeatedBlock, hasState, readState, recordBlock, statePath, updateState } from './state';

let root: string;
beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'agent-state-'));
});
afterEach(() => rmSync(root, { recursive: true, force: true }));

describe('agent-run state', () => {
  it('reads a missing file as empty state', () => {
    expect(readState(root)).toEqual({ blocks: [] });
    expect(hasState(root)).toBe(false);
  });

  it('treats a corrupt or wrong-shaped file as empty state', () => {
    mkdirSync(join(root, '.agent-run'));
    writeFileSync(statePath(root), '{nope');
    expect(readState(root)).toEqual({ blocks: [] });
    writeFileSync(statePath(root), '[1]');
    expect(readState(root)).toEqual({ blocks: [] });
  });

  it('appends blocks with tool, target and timestamp, creating .agent-run/', () => {
    recordBlock(root, { tool: 'Edit', target: 'CLAUDE.md', kind: 'deny-path', at: '2026-11-16T10:00:00.000Z' });
    recordBlock(root, { tool: 'Bash', target: 'git push' });
    const state = JSON.parse(readFileSync(statePath(root), 'utf8'));
    expect(state.blocks).toHaveLength(2);
    expect(state.blocks[0]).toEqual({ tool: 'Edit', target: 'CLAUDE.md', kind: 'deny-path', at: '2026-11-16T10:00:00.000Z' });
    expect(state.blocks[1].at).toMatch(/^\d{4}-\d\d-\d\dT/);
    expect(existsSync(`${statePath(root)}.lock`)).toBe(false);
  });

  it('preserves fields written by other writers', () => {
    writeFileSync(join(root, 'x'), '');
    mkdirSync(join(root, '.agent-run'));
    writeFileSync(statePath(root), JSON.stringify({ turns: 12, fixes: { gate: 2 }, blocks: [] }));
    recordBlock(root, { tool: 'Edit', target: 'a' });
    const state = readState(root);
    expect(state.turns).toBe(12);
    expect(state.fixes).toEqual({ gate: 2 });
    expect(state.blocks).toHaveLength(1);
  });

  it('updateState lets callers change other fields', () => {
    updateState(root, (s) => {
      s.turns = 3;
    });
    expect(readState(root).turns).toBe(3);
  });

  it('counts blocks per tool+target', () => {
    for (const [tool, target] of [
      ['Edit', 'a'],
      ['Edit', 'a'],
      ['Write', 'a'],
      ['Edit', 'b'],
    ] as const) {
      recordBlock(root, { tool, target });
    }
    const s = readState(root);
    expect(countBlocks(s, 'Edit', 'a')).toBe(2);
    expect(countBlocks(s, 'Write', 'a')).toBe(1);
    expect(countBlocks(s, 'Bash', 'a')).toBe(0);
  });

  it('detects situation 9: same tool+target three times', () => {
    recordBlock(root, { tool: 'Edit', target: 'a' });
    recordBlock(root, { tool: 'Edit', target: 'b' });
    recordBlock(root, { tool: 'Edit', target: 'a' });
    expect(findRepeatedBlock(readState(root))).toBeNull();
    recordBlock(root, { tool: 'Write', target: 'a' });
    expect(findRepeatedBlock(readState(root))).toBeNull();
    recordBlock(root, { tool: 'Edit', target: 'a' });
    expect(findRepeatedBlock(readState(root))).toEqual({ tool: 'Edit', target: 'a', count: 3 });
    expect(findRepeatedBlock(readState(root), 4)).toBeNull();
  });
});
