# 005 — Consolidate hand-typed easing/duration literals into a shared home motion constant

- **Status**: TODO
- **Commit**: 30961c2
- **Severity**: LOW
- **Category**: Cohesion & tokens
- **Estimated scope**: 3 files (1 new, 2 edited — more if plan 004 already ran, see Boundaries)

## Problem

The same easing curve is hand-typed as a raw array in two files instead of referencing one shared constant, even though it's meant to be this repo's `--ease-out` token (`packages/tailwind-config/src/theme.css:135`: `--ease-out: cubic-bezier(0, 0, 0.2, 1)`):

```tsx
// apps/storefront/src/app/[locale]/(shop)/_lib/components/home/SectionHero.tsx:29 — current
const childTransition = prefersReducedMotion ? { duration: 0 } : { duration: 0.3, ease: [0, 0, 0.2, 1] as const };
```

```tsx
// apps/storefront/src/app/[locale]/(shop)/_lib/components/home/HeroCarousel.tsx:83 — current
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.38, ease: [0, 0, 0.2, 1] }}
```

`HeroCarousel.tsx:83` additionally hand-types `duration: 0.38` (380ms), a value close to but distinct from this repo's own `--duration-slow: 350ms` token (`packages/tailwind-config/src/theme.css:139`) — a second near-duplicate instead of a reused value.

## Target

Add one small shared constants file scoped to the home page's motion, and import from it in both files instead of re-typing the curve/duration.

```ts
/* target — new file: apps/storefront/src/app/[locale]/(shop)/_lib/components/home/motion.ts */
export const EASE_OUT = [0, 0, 0.2, 1] as const;
export const DURATION_SLOW = 0.35;
```

```tsx
/* target — SectionHero.tsx:29 */
const childTransition = prefersReducedMotion ? { duration: 0 } : { duration: 0.3, ease: EASE_OUT };
```

```tsx
/* target — HeroCarousel.tsx:83 */
              transition={prefersReducedMotion ? { duration: 0 } : { duration: DURATION_SLOW, ease: EASE_OUT }}
```

`HeroCarousel.tsx`'s duration changes from `0.38` to `0.35` (350ms, `DURATION_SLOW`) — a 30ms difference, imperceptible, but now traceable to the same token as the rest of the codebase instead of a one-off value. `SectionHero.tsx`'s `duration: 0.3` for `childTransition` is left as its own literal — it is not the same value as `DURATION_SLOW` (300ms vs 350ms) and this plan does not force every duration in the file to match; only the duplicated _easing_ array and `HeroCarousel`'s near-duplicate _duration_ are in scope.

## Repo conventions to follow

- New shared constants for this directory's components live alongside the components themselves (there is no existing motion-constants module anywhere in `apps/storefront/src`) — `home/motion.ts` next to `home/SectionHero.tsx` and `home/HeroCarousel.tsx`, not in the unrelated `_lib/constants/` folder (that folder holds `payment-config.ts`, a different domain).
- Both files already import from sibling `home/` files with relative-looking `@/app/[locale]/(shop)/_lib/components/home/...` aliases (e.g. `SectionHero.tsx:11-12`) — import `EASE_OUT`/`DURATION_SLOW` the same way: `import { EASE_OUT } from '@/app/[locale]/(shop)/_lib/components/home/motion';`.

## Steps

1. Create `apps/storefront/src/app/[locale]/(shop)/_lib/components/home/motion.ts` with the two exported constants shown in Target.
2. In `SectionHero.tsx`, add the import and replace the inline `[0, 0, 0.2, 1] as const` at line 29 with `EASE_OUT`.
3. In `HeroCarousel.tsx`, add the import and replace both the inline `[0, 0, 0.2, 1]` and `0.38` at line 83 with `EASE_OUT` and `DURATION_SLOW` respectively.
4. Grep both files for any other occurrence of the literal `[0, 0, 0.2, 1]` before finishing this plan — if plan 004 (HeroCarousel entrance sync) already ran, it introduced a third occurrence in `SectionHero.tsx` (the new `motion.div` wrapping `<HeroCarousel />`); replace that one too so no hand-typed copy of the curve remains in either file.

## Boundaries

- Do NOT change any `duration` value other than `HeroCarousel.tsx:83`'s `0.38 → 0.35` — in particular, do not touch `SectionHero.tsx`'s `duration: 0.3` or the `staggerChildren: 0.07`/`0.06` values in either file.
- Do NOT touch `NewsletterForm.tsx` (plan 003 introduces its own, separately-scoped `[0, 0, 0.2, 1]` instances — out of scope here; this plan only consolidates literals that existed before this round of plans).
- Do NOT create a repo-wide or package-level motion-tokens module — keep this scoped to `home/motion.ts`, matching the existing `plans/` directory's own scope of `_lib/components/home`.
- If `SectionHero.tsx:29` or `HeroCarousel.tsx:83` no longer contain the literal `[0, 0, 0.2, 1]` (drift since commit `30961c2`), STOP and report instead of guessing which value to replace.

## Verification

- **Mechanical**: `pnpm --filter storefront typecheck` and `pnpm --filter storefront lint` both pass with no new errors.
- **Feel check**: this is a value-for-value substitution with one 30ms duration change too small to perceive — confirm by reading the diff, not by eye. Reload the home page once and confirm the Hero and carousel still animate in (no regression from the import), rather than looking for a visible difference.
- **Done when**: `SectionHero.tsx` and `HeroCarousel.tsx` both import `EASE_OUT` (and `HeroCarousel.tsx` also imports `DURATION_SLOW`) from `home/motion.ts` instead of hand-typing the curve/duration, and no literal `[0, 0, 0.2, 1]` remains in either file.
