// @vitest-environment node
import { describe, expect, it } from 'vitest';

import { FINDING_SEVERITIES, RESULT_VALUES, implementerSchema, plannerSchema, reviewerSchema, roleSchemas } from './schemas';

type Schema = {
  type?: string;
  properties?: Record<string, { type?: string; enum?: readonly string[]; items?: Schema }>;
  required?: readonly string[];
  additionalProperties?: boolean;
};

const roles = [
  ['planner', plannerSchema, ['result', 'reason']],
  ['implementer', implementerSchema, ['result', 'reason']],
  ['reviewer', reviewerSchema, ['result', 'reason', 'findings']],
] as const;

describe.each(roles)('%s schema', (_name, schema, required) => {
  const s = schema as Schema;

  it('is a plain JSON object schema (survives JSON round-trip, usable with --json-schema)', () => {
    expect(JSON.parse(JSON.stringify(schema))).toEqual(schema);
    expect(s.type).toBe('object');
    expect(s.additionalProperties).toBe(false);
  });

  it('requires the contract fields and declares each of them', () => {
    expect(s.required).toEqual(expect.arrayContaining([...required]));
    for (const key of s.required ?? []) expect(s.properties).toHaveProperty(key);
  });

  it('restricts result to ok | need_info | blocked', () => {
    expect(s.properties?.result?.enum).toEqual([...RESULT_VALUES]);
    expect([...RESULT_VALUES]).toEqual(['ok', 'need_info', 'blocked']);
  });

  it('types reason as string', () => {
    expect(s.properties?.reason?.type).toBe('string');
  });
});

describe('role specifics', () => {
  it('implementer carries commit_message and an approval request', () => {
    const props = (implementerSchema as Schema).properties ?? {};
    expect(props.commit_message?.type).toBe('string');
    expect(props.requested?.type).toBe('object');
  });

  it('planner carries questions for need_info', () => {
    const props = (plannerSchema as Schema).properties ?? {};
    expect(props.questions?.type).toBe('array');
    expect(props.questions?.items).toEqual({ type: 'string' });
  });

  it('reviewer findings need severity', () => {
    const items = ((reviewerSchema as Schema).properties?.findings?.items ?? {}) as Schema;
    expect(items.required).toEqual(expect.arrayContaining(['severity', 'message']));
    expect(items.properties?.severity?.enum).toEqual([...FINDING_SEVERITIES]);
  });

  it('roleSchemas maps every role', () => {
    expect(Object.keys(roleSchemas).sort()).toEqual(['implementer', 'planner', 'reviewer']);
  });
});
