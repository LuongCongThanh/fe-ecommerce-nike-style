/**
 * Gates placeholder content that has no verified source (home testimonials, PDP mock reviews/specs) —
 * one named seam instead of `NODE_ENV !== 'production'` re-typed per call site. Deliberately separate
 * from `shared/lib/env.ts`: that module parses the *full* `process.env` (including server-only vars
 * like `NEXT_PUBLIC_APP_URL`), which is empty in a client bundle — importing it from a `'use client'`
 * component (e.g. `ProductDetailTabs.tsx`) would throw at module load. `process.env.NODE_ENV` is the
 * one env read Next.js inlines on both server and client, so this stays safe to import from either.
 */
export function isMockContentEnabled(): boolean {
  return process.env.NODE_ENV !== 'production';
}
