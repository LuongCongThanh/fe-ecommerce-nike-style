// @vitest-environment node
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { parseFrontmatter, readSpecInfo } from './spec';

const dirs: string[] = [];
function task(spec?: string): string {
  const d = mkdtempSync(join(tmpdir(), 'spec-'));
  dirs.push(d);
  if (spec !== undefined) writeFileSync(join(d, 'spec.md'), spec);
  return d;
}
afterEach(() => dirs.splice(0).forEach((d) => rmSync(d, { recursive: true, force: true })));

describe('spec frontmatter', () => {
  it('parses flat keys and strips trailing comments', () => {
    expect(parseFrontmatter('---\nstatus: todo # x\nkind: ui\npr:\n---\n# body\nkind: logic')).toEqual({ status: 'todo', kind: 'ui', pr: '' });
  });
  it('reads kind and allow-test-changes', () => {
    expect(readSpecInfo(task('---\nkind: refactor\nallow-test-changes: true\n---\n'))).toEqual({ kind: 'refactor', allowTestChanges: true });
  });
  it('unknown kind or missing spec -> null kind', () => {
    expect(readSpecInfo(task('---\nkind: weird\n---\n')).kind).toBeNull();
    expect(readSpecInfo(task()).kind).toBeNull();
  });
});
