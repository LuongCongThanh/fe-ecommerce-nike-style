# 001 — Fold TrustBadgeList into the Hero's staggered reveal

- **Status**: DONE
- **Commit**: ae37e99
- **Severity**: MEDIUM
- **Category**: Cohesion & tokens
- **Estimated scope**: 1 file (`SectionHero.tsx`), ~5 line change

## Problem

`SectionHero` wraps its badge, title lines, subtitle, and CTA row in a `motion.div` that staggers them in with `revealUp`/`reducedVariant`. `TrustBadgeList` renders as a **sibling** of that `motion.div`, not a child, so it never participates in the stagger — it's present in the DOM immediately and simply appears with the rest of the page paint, popping in while its siblings above it are still animating in. This runs on every homepage load, so the mismatch is visible to 100% of visitors.

Current code, `apps/storefront/src/app/[locale]/(shop)/_lib/components/home/SectionHero.tsx:36-83`:

```tsx
const revealUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

const reducedVariant = {
  hidden: { opacity: 1, y: 0 },
  show: { opacity: 1, y: 0 },
};

export function SectionHero(): React.JSX.Element {
  const locale = useLocale();
  const titleLines = homeHeroData.title.split('\n');
  const prefersReducedMotion = useReducedMotion() === true;
  const variants = prefersReducedMotion ? reducedVariant : revealUp;
  const childTransition = prefersReducedMotion ? { duration: 0 } : { duration: 0.3, ease: [0, 0, 0.2, 1] as const };

  return (
    <section className="bg-surface-inverse text-surface-inverse-foreground relative isolate min-h-[70dvh] overflow-hidden md:min-h-[85dvh]">
      <Image src={homeHeroData.image} alt="" aria-hidden="true" fill priority sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/30 to-transparent" />

      <motion.div
        initial="hidden"
        animate="show"
        transition={{ staggerChildren: prefersReducedMotion ? 0 : 0.06, delayChildren: 0 }}
        className="relative z-10 flex h-full min-h-[70vh] flex-col justify-end gap-5 px-4 pt-24 pb-10 sm:px-6 md:min-h-[85vh] md:px-10 md:pb-14 lg:px-16"
      >
        <motion.span
          variants={variants}
          transition={childTransition}
          className="w-fit rounded-full border border-white/20 px-4 py-1.5 text-sm font-semibold tracking-wide text-white/80"
        >
          {homeHeroData.badge}
        </motion.span>

        <h1 className="font-display max-w-3xl text-5xl font-black tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl">
          {titleLines.map((line) => (
            <motion.span key={line} variants={variants} transition={childTransition} className="block">
              {line}
            </motion.span>
          ))}
        </h1>

        <motion.p variants={variants} transition={childTransition} className="max-w-md text-base text-white/70 md:text-lg">
          {homeHeroData.subtitle}
        </motion.p>

        <motion.div variants={variants} transition={childTransition} className="flex flex-wrap items-center gap-3 pt-2">
          <Button
            asChild
            size="lg"
            className="bg-primary-foreground hover:bg-primary-foreground/90 h-12 rounded-full px-8 text-base font-semibold text-neutral-950"
          >
            <Link href={`/${locale}/products`}>{homeHeroData.cta}</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-12 rounded-full border-white/30 bg-transparent px-8 text-base font-semibold text-white hover:bg-white/10 hover:text-white"
          >
            <Link href={`/${locale}/products?flash-sale=true`}>{homeHeroData.ctaSale}</Link>
          </Button>
        </motion.div>
      </motion.div>

      <div className="relative z-10 container mx-auto px-4 py-6 sm:px-6 md:px-10 lg:px-16">
        <TrustBadgeList items={homeHeroData.trustItems} />
      </div>
    </section>
  );
}
```

`TrustBadgeList` itself (`apps/storefront/src/app/[locale]/(shop)/_lib/components/home/TrustBadgeList.tsx`) is a plain, non-`'use client'` component with no motion of its own — it just renders a `<ul>`. It has no props or behavior that need to change; only how `SectionHero` wraps it changes.

## Target

Move the `<div>` that renders `TrustBadgeList` **inside** the same `motion.div` stagger container, as one more staggered child using the exact same `variants`/`childTransition` the other children already use. This makes it the 5th item in the stagger sequence (badge → title lines → subtitle → CTA row → trust badges), so it fades/slides in on the same rhythm instead of appearing instantly.

```tsx
/* target — apps/storefront/src/app/[locale]/(shop)/_lib/components/home/SectionHero.tsx */
<motion.div
  initial="hidden"
  animate="show"
  transition={{ staggerChildren: prefersReducedMotion ? 0 : 0.06, delayChildren: 0 }}
  className="relative z-10 flex h-full min-h-[70vh] flex-col justify-end gap-5 px-4 pt-24 pb-10 sm:px-6 md:min-h-[85vh] md:px-10 md:pb-14 lg:px-16"
>
  <motion.span
    variants={variants}
    transition={childTransition}
    className="w-fit rounded-full border border-white/20 px-4 py-1.5 text-sm font-semibold tracking-wide text-white/80"
  >
    {homeHeroData.badge}
  </motion.span>

  {/* ...title lines, subtitle, CTA row unchanged... */}

  <motion.div variants={variants} transition={childTransition} className="flex flex-wrap items-center gap-3 pt-2">
    {/* ...buttons unchanged... */}
  </motion.div>

  <motion.div variants={variants} transition={childTransition}>
    <TrustBadgeList items={homeHeroData.trustItems} />
  </motion.div>
</motion.div>
```

The standalone `<div className="relative z-10 container mx-auto px-4 py-6 ...">` that used to wrap `TrustBadgeList` outside the `motion.div` is removed — its layout responsibility (container/padding) either moves onto the new `motion.div` or is absorbed by adjusting the parent flex layout. See Steps for the exact approach.

No new easing, duration, or spring values are needed — this reuses `variants`, `childTransition`, and the existing `staggerChildren: 0.06` (60ms, within the repo's 30–80ms stagger guidance) verbatim.

## Repo conventions to follow

- Stagger children by giving each one the same `variants` + `transition={childTransition}` props, exactly as `SectionHero.tsx:42-78` already does for the badge, title lines, subtitle, and CTA row — imitate that pattern for the new `TrustBadgeList` wrapper.
- Reduced motion is handled by branching `variants`/`childTransition` on `prefersReducedMotion` (`useReducedMotion() === true`) at the top of the component (`SectionHero.tsx:27-29`) — do not add a second, separate reduced-motion check for the moved element; it inherits the same `variants`/`childTransition` values already computed.

## Steps

1. In `apps/storefront/src/app/[locale]/(shop)/_lib/components/home/SectionHero.tsx`, delete the closing structure that currently renders `TrustBadgeList` as a sibling after `</motion.div>`:
   ```tsx
   <div className="relative z-10 container mx-auto px-4 py-6 sm:px-6 md:px-10 lg:px-16">
     <TrustBadgeList items={homeHeroData.trustItems} />
   </div>
   ```
2. Move `<TrustBadgeList items={homeHeroData.trustItems} />` to become the last child inside the existing `motion.div` (right after the CTA row's closing `</motion.div>`, still inside the outer stagger container), wrapped in its own `motion.div` with `variants={variants}` and `transition={childTransition}`:
   ```tsx
   <motion.div variants={variants} transition={childTransition}>
     <TrustBadgeList items={homeHeroData.trustItems} />
   </motion.div>
   ```
3. Check the resulting layout against the removed wrapper's classes (`relative z-10 container mx-auto px-4 py-6 sm:px-6 md:px-10 lg:px-16`). The outer `motion.div` already applies `px-4 sm:px-6 md:px-10 lg:px-16` at the section level, so the inline `px-*` on the old wrapper was likely redundant horizontal padding — but `py-6`/`container`/`mx-auto` were not duplicated anywhere else. Preserve the visual position of the trust badges (same horizontal alignment and roughly the same vertical gap below the CTA row) by either:
   - adding `container mx-auto` utilities to the new `motion.div` if the trust badges need to be full-width/centered independent of the flex column's `gap-5`, or
   - relying on the parent's existing `gap-5` flex spacing if `container mx-auto` isn't actually needed once it's a flex child (the parent is `flex h-full ... flex-col justify-end gap-5`, so a plain child already gets the `gap-5` spacing and inherited horizontal padding).
     Pick whichever keeps the trust badges visually in the same place as before — this is a layout-equivalence check, not a motion decision. If ambiguous, keep `container mx-auto` on the new wrapper to be safe, since the section's own horizontal padding is already applied one level up via the outer `motion.div`'s classes, and the previous per is with padding might have compounded margin — verify against a running instance rather than guessing.

## Boundaries

- Do NOT touch `TrustBadgeList.tsx` — it needs no code changes, only where it's mounted.
- Do NOT change `variants`, `reducedVariant`, `childTransition`, or the `staggerChildren`/`delayChildren` values — reuse them as-is.
- Do NOT touch any other file in `home/` — this plan is scoped to `SectionHero.tsx` only.
- Do NOT add a new dependency or a new easing/duration token.
- If the JSX structure around `TrustBadgeList` or the `motion.div` stagger container has changed since commit `ae37e99` (drift), STOP and report instead of improvising a merge.

## Verification

- **Mechanical**: `pnpm --filter storefront typecheck` (or the repo's equivalent typecheck script) and `pnpm --filter storefront lint` both pass with no new errors.
- **Feel check**: load the homepage, watch the hero on first paint:
  - The trust badges (e.g. "Free shipping", whatever `homeHeroData.trustItems` contains) now fade/slide up on the same stagger rhythm as the badge/title/subtitle/CTA — they should visibly be the _last_ item in the sequence, not already sitting there when the sequence starts.
  - In DevTools Animations panel, set playback to 10% and scrub through: confirm there are now 5 staggered entries (badge, title line(s), subtitle, CTA row, trust badges) at even ~60ms offsets, and the trust badges are not sitting fully-opaque before their turn.
  - Toggle `prefers-reduced-motion` (Rendering panel) and reload: confirm the trust badges appear immediately at full opacity along with everything else (no delay, no movement) — same as the rest of the hero content under reduced motion.
  - Confirm the trust badges' horizontal alignment and vertical spacing below the CTA buttons looks the same as before the change (no unintended layout shift from the removed wrapper's padding).
- **Done when**: `TrustBadgeList` is a child of the stagger `motion.div`, animates on the same `variants`/`childTransition` as its siblings, reduced motion still resolves it instantly, and its visual position is unchanged from before the edit.
