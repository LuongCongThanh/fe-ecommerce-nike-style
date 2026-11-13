# 006 — Use full transform string instead of the `y` shorthand in SectionHero's reveal variants

- **Status**: TODO
- **Commit**: 30961c2
- **Severity**: LOW
- **Category**: Performance
- **Estimated scope**: 1 file (`SectionHero.tsx`)

## Problem

`SectionHero`'s entrance variants animate via Framer Motion's `y` shorthand instead of a full `transform` string:

```tsx
// apps/storefront/src/app/[locale]/(shop)/_lib/components/home/SectionHero.tsx:14-22 — current
const revealUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

const reducedVariant = {
  hidden: { opacity: 1, y: 0 },
  show: { opacity: 1, y: 0 },
};
```

Per AUDIT.md's performance rule: "Framer Motion `x`/`y`/`scale` shorthands are not hardware-accelerated — they run on the main thread and drop frames under load." Real-world risk here is low — this is a one-shot, 6-element mount animation on a page that isn't otherwise busy — but it's a mechanical, zero-ambiguity fix.

## Target

```tsx
/* target — SectionHero.tsx:14-22 */
const revealUp = {
  hidden: { opacity: 0, transform: 'translateY(12px)' },
  show: { opacity: 1, transform: 'translateY(0px)' },
};

const reducedVariant = {
  hidden: { opacity: 1, transform: 'translateY(0px)' },
  show: { opacity: 1, transform: 'translateY(0px)' },
};
```

The `12px` offset is unchanged — only the property changes from the `y` shorthand to the equivalent full `transform` string, per AUDIT.md: "Target: the full transform string, `animate={{ transform: "translateX(100px)" }}`."

## Repo conventions to follow

- This is the same fix already applied when writing the _new_ code in plans 002, 003, and 004 in this same round — all three use `transform: 'translateY(...)'` strings rather than the `y` shorthand from the start, specifically to avoid introducing this finding fresh. This plan brings `SectionHero.tsx`'s pre-existing variants in line with that same convention.

## Steps

1. In `apps/storefront/src/app/[locale]/(shop)/_lib/components/home/SectionHero.tsx`, replace the `revealUp` and `reducedVariant` objects at lines 14-22 with the versions shown in Target — `y: 12` → `transform: 'translateY(12px)'`, `y: 0` → `transform: 'translateY(0px)'`, in both variants.

## Boundaries

- Do NOT change `childTransition`, `staggerChildren`, `delayChildren`, or any easing/duration value — this plan only changes the animated property, not the timing.
- Do NOT touch any other file — `revealUp`/`reducedVariant` are local to `SectionHero.tsx` and not imported elsewhere.
- If `SectionHero.tsx:14-22` no longer matches the current code shown above (drift since commit `30961c2`), STOP and report instead of guessing which lines to edit.

## Verification

- **Mechanical**: `pnpm --filter storefront typecheck` and `pnpm --filter storefront lint` both pass with no new errors.
- **Feel check**: reload the home page and watch the Hero's entrance — the badge/title/subtitle/CTA/trust-badges should fade+slide up exactly as before (12px rise, same easing/duration); this change is not visually distinguishable from the current behavior, it only changes which CSS property does the work. Confirm in DevTools Elements panel that the animated inline style shows `transform: translateY(...)` rather than a separate `y`-only transform composition.
- **Done when**: `revealUp` and `reducedVariant` animate via `transform` strings and the Hero's entrance looks identical to before the change.
