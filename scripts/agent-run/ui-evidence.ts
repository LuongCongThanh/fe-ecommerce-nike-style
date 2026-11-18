/** Filesystem evidence complements the browser response; this is not a browser-attestation boundary. */
import { lstatSync, readFileSync, realpathSync } from 'node:fs';
import { dirname, relative, resolve, sep } from 'node:path';

import { z } from 'zod';

import { isReviewFinding } from './schemas';

const nonempty = z.string().trim().min(1);
export const uiResult = z.object({
  result: z.enum(['ok', 'need_info', 'blocked']),
  reason: z.string(),
  findings: z.array(z.unknown()).refine((items) => items.every(isReviewFinding)),
  evidence: z
    .object({
      url: z.url(),
      viewport: z.object({ width: z.number().int().positive(), height: z.number().int().positive() }),
      state: nonempty,
      actions: z.array(nonempty).min(1),
      artifact: nonempty,
    })
    .optional(),
});

export function validateUiEvidence(value: unknown, root: string, origin: string, artifact: string, started: number) {
  const parsed = uiResult.safeParse(value);
  if (!parsed.success) throw new Error('Malformed UI response');
  const r = parsed.data;
  if (r.result !== 'ok') throw new Error(`UI reported ${r.result}: ${r.reason}`);
  const e = r.evidence;
  if (!e || new URL(e.url).origin !== origin || resolve(root, e.artifact) !== artifact)
    throw new Error('Missing UI evidence or wrong route/artifact');
  const rel = relative(realpathSync(root), realpathSync(artifact));
  if (rel.startsWith(`..${sep}`) || rel === '..' || resolve(root, rel) !== artifact)
    throw new Error('UI artifact escaped checkout or used a symlink');
  let parent = artifact;
  while (parent !== root) {
    if (lstatSync(parent).isSymbolicLink()) throw new Error('UI artifact used a symlink');
    parent = dirname(parent);
  }
  // Unique, previously absent filename prevents reuse; tolerate filesystem timestamp granularity.
  const stat = lstatSync(artifact);
  if (
    !stat.isFile() ||
    stat.mtimeMs < started - 1000 ||
    stat.size < 8 ||
    !readFileSync(artifact)
      .subarray(0, 8)
      .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  )
    throw new Error('UI screenshot missing, stale or not PNG');
  return r.findings.filter(isReviewFinding);
}
