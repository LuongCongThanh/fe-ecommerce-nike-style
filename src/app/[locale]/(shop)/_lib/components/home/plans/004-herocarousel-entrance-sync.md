# 004 — Sync HeroCarousel's entrance with the Hero text stagger

- **Status**: TODO
- **Commit**: 30961c2
- **Severity**: MEDIUM
- **Category**: Missed opportunities / Cohesion
- **Estimated scope**: 1 file (`SectionHero.tsx`)

## Problem

`SectionHero` staggers its badge/title/subtitle/CTA/trust-badges text column in on mount (`staggerChildren: 0.07`, 6 children × 70ms ≈ 420ms to the last item finishing its own ~300ms transition ≈ ~720ms total). `HeroCarousel` sits as a grid sibling of that staggering `motion.div`, with no entrance animation of its own — it's on-screen at full opacity from the first paint, while the text beside it is still fading/sliding in for most of a second. The two halves of the same above-the-fold hero read as out of sync.

Current code, `apps/storefront/src/app/[locale]/(shop)/_lib/components/home/SectionHero.tsx:36-87`:

```tsx
<div className="relative container mx-auto grid min-h-[calc(100dvh-7rem)] items-center gap-10 py-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
  <motion.div initial="hidden" animate="show" transition={{ staggerChildren: prefersReducedMotion ? 0 : 0.07 }} className="flex flex-col items-start">
    {/* ...badge, title lines, subtitle, CTA row, trust badges — all staggered children... */}
  </motion.div>

  <HeroCarousel />
</div>
```

`HeroCarousel` is a grid **sibling** of the text column, not a descendant, so it structurally cannot join that `motion.div`'s `staggerChildren` orchestration — Framer Motion's variant propagation only flows to actual children of the animating element.

## Target

Give `HeroCarousel` its own independent fade/slide-in on mount, timed with a short delay so it settles in near where the text stagger finishes, instead of appearing instantly. Reuse the exact easing/duration this file already uses for its own children (`childTransition`, `SectionHero.tsx:29`) plus a `delay` so the two halves feel connected rather than needing a shared orchestrator.

```tsx
/* target — apps/storefront/src/app/[locale]/(shop)/_lib/components/home/SectionHero.tsx:86 */
<motion.div
  initial={prefersReducedMotion ? false : { opacity: 0, transform: 'translateY(16px)' }}
  animate={{ opacity: 1, transform: 'translateY(0px)' }}
  transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3, ease: [0, 0, 0.2, 1], delay: 0.15 }}
>
  <HeroCarousel />
</motion.div>
```

Values used:

- `ease: [0, 0, 0.2, 1]` and `duration: 0.3` — copied verbatim from this file's existing `childTransition` (`SectionHero.tsx:29`), so the carousel's entrance feels like part of the same motion language as the text beside it, not a separately-invented curve.
- `delay: 0.15` (150ms) — roughly where the middle of the text stagger sequence is (title lines / subtitle are animating in around then), so the carousel starts moving while the text is still settling rather than only after everything else has finished. This is a new, deliberately-chosen value (not a repo token) tuned for this specific cross-column sync — flag it explicitly in the feel check below since it can't be verified from code alone.
- Full `transform` string (`translateY(16px)` → `translateY(0px)`), not the `y` shorthand, per AUDIT.md's performance rule — do not introduce a fresh instance of the finding covered in plan 006.
- `initial={false}` under reduced motion (matching the pattern in `HeroCarousel.tsx:80` and `SectionHero.tsx`'s own `reducedVariant`) so nothing animates or repaints when motion is disabled.

## Repo conventions to follow

- `prefersReducedMotion` is already computed once at the top of `SectionHero.tsx:27` — reuse that binding, do not recompute it.
- Reuse the literal `ease: [0, 0, 0.2, 1]` and `duration: 0.3` values already present in this same file's `childTransition` rather than introducing a third distinct duration/easing pair into the Hero.

## Steps

1. In `apps/storefront/src/app/[locale]/(shop)/_lib/components/home/SectionHero.tsx`, import `motion` is already imported (`SectionHero.tsx:7`) — no new import needed.
2. Replace the bare `<HeroCarousel />` at `SectionHero.tsx:86` with the `motion.div`-wrapped version shown in Target, using the `prefersReducedMotion` variable already in scope.

## Boundaries

- Do NOT modify `HeroCarousel.tsx` itself — this plan only changes how it's mounted from `SectionHero.tsx`.
- Do NOT change the text column's `staggerChildren`/`delayChildren`/`variants`/`childTransition` — this plan only adds a new, independent wrapper around the carousel.
- Do NOT attempt to fold `HeroCarousel` into the text column's `motion.div` — it is a separate grid cell and must stay a sibling at the grid level.
- If plan 005 (consolidate ease/duration literals) has already run before this plan, `[0, 0, 0.2, 1]` may already be a shared constant instead of an inline literal in this file — in that case, import and use that constant instead of re-inlining the array, but keep the `duration: 0.3, delay: 0.15` values as shown.
- If the grid structure at `SectionHero.tsx:36-87` has changed since commit `30961c2` (drift), STOP and report instead of guessing where the carousel now sits.

## Verification

- **Mechanical**: `pnpm --filter storefront typecheck` and `pnpm --filter storefront lint` both pass with no new errors.
- **Feel check**: reload the home page (hard refresh, not a client-side navigation, so the entrance actually plays):
  - The carousel image fades/slides up starting shortly after the badge and title begin animating, not instantly on paint and not only after the whole text column has finished.
  - The carousel's motion reads as part of the same "moment" as the text — not late enough to feel like an afterthought, not so early it front-runs the text.
  - In DevTools Animations panel, set playback to 10% and scrub: confirm the carousel's animation starts partway through the text stagger's timeline, not at t=0 and not after the text's last item finishes.
  - Toggle `prefers-reduced-motion` (Rendering panel) and reload: the carousel appears immediately at full opacity with no movement, same as the text column.
  - This is a feel-tuned delay (150ms) — if it looks wrong (too early/late) when actually watching it, adjust only the `delay` value, not the easing/duration/transform values.
- **Done when**: `HeroCarousel` fades/slides in on mount in visible sync with the text column's stagger, and reduced motion disables it exactly like the rest of the Hero.
