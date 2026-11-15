// @vitest-environment node
import { describe, expect, it } from 'vitest';

import { appendQuestions, parseApproved, parseBlockedBy, setField } from './spec-file';

const spec = `---
status: ready-for-agent # xem vòng đời
blocked-by: [01-a, 02-b]
pr:
kind: ui
approved: false
---

# Spec 03: x
`;

describe('setField', () => {
  it('replaces an existing value and drops the trailing comment', () => {
    const out = setField(spec, 'status', 'in-progress');
    expect(out).toContain('\nstatus: in-progress\n');
    expect(out).not.toContain('xem vòng đời');
  });
  it('fills an empty field', () => {
    expect(setField(spec, 'pr', '#12')).toContain('\npr: #12\n');
  });
  it('adds a missing field before the closing fence', () => {
    const out = setField(spec, 'retro-turns', '4');
    expect(out).toMatch(/retro-turns: 4\n---/);
  });
  it('leaves the body untouched', () => {
    expect(setField(spec, 'status', 'review').endsWith('# Spec 03: x\n')).toBe(true);
  });
});

describe('parseBlockedBy', () => {
  it('reads an inline list', () => expect(parseBlockedBy(spec)).toEqual(['01-a', '02-b']));
  it('reads an empty list', () => expect(parseBlockedBy('---\nblocked-by: []\n---\n')).toEqual([]));
  it('reads a block list', () => expect(parseBlockedBy('---\nblocked-by:\n  - 01-a\n  - 02-b\nstatus: todo\n---\n')).toEqual(['01-a', '02-b']));
  it('treats a missing field as none', () => expect(parseBlockedBy('---\nstatus: todo\n---\n')).toEqual([]));
});

describe('parseApproved (D43 list form)', () => {
  it('false / missing / true mean nothing approved', () => {
    for (const v of ['approved: false', 'approved: true', 'approved:', 'status: todo']) {
      expect(parseApproved(`---\n${v}\n---\n`)).toEqual({ paths: [], commands: [] });
    }
  });
  it('reads inline lists, honouring quotes with commas', () => {
    const t = '---\napproved:\n  files: [package.json, "src/a,b.ts"]\n  commands: ["pnpm add zod", pnpm lint]\n---\n';
    expect(parseApproved(t)).toEqual({ paths: ['package.json', 'src/a,b.ts'], commands: ['pnpm add zod', 'pnpm lint'] });
  });
  it('reads block lists', () => {
    const t = '---\napproved:\n  files:\n    - package.json\n    - next.config.ts\n  commands:\n    - "pnpm add zod"\nkind: ui\n---\n';
    expect(parseApproved(t)).toEqual({ paths: ['package.json', 'next.config.ts'], commands: ['pnpm add zod'] });
  });
});

describe('appendQuestions', () => {
  it('appends a section with the questions', () => {
    const out = appendQuestions(spec, ['Ai?', 'Khi nào?'], '2026-11-16 10:00', 'planner');
    expect(out).toMatch(/## Câu hỏi cho người duyệt \(planner, 2026-11-16 10:00\)\n\n- Ai\?\n- Khi nào\?\n$/);
  });
});
