# 002 — Add scroll-entrance reveal to the six static home sections

- **Status**: DONE
- **Commit**: 30961c2
- **Severity**: HIGH
- **Category**: Missed opportunities
- **Estimated scope**: 7 files (1 new shared primitive, 6 one-line-wrapper edits)

## Problem

`SectionHero.tsx` is the only section on the home page with entrance motion (a `framer-motion` stagger on mount). The six sections below it render fully static — no transition of any kind — so they simply pop into the layout as the user scrolls, in visible contrast to the Hero right above them. This is the single biggest visual gap on the page.

Confirmed static, current code:

```tsx
// apps/storefront/src/app/[locale]/(shop)/_lib/components/home/SectionFeaturedCategories.tsx:14-18 — current
  return (
    <section className="bg-muted/40">
      <div className="container mx-auto px-4 py-(--space-section-categories) md:py-(--space-section-categories-lg)">
        <SectionHeading title={t('title')} subtitle={t('subtitle')} ctaLabel={t('viewAll')} ctaHref={`/${locale}/products`} />
        <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-6">
```

```tsx
// apps/storefront/src/app/[locale]/(shop)/_lib/components/home/SectionBestSellers.tsx:14-17 — current
  return (
    <section className="container mx-auto px-4 py-(--space-section-best-sellers)">
      <ProductCarousel title={t('title')} ctaLabel={t('viewAll')} ctaHref={`/${locale}/products`}>
        {bestSellers.map((product) => (
```

```tsx
// apps/storefront/src/app/[locale]/(shop)/_lib/components/home/SectionFlashSale.tsx:17-19 — current
  return (
    <section className="container mx-auto py-(--space-section-flash-sale)">
      <div className="bg-surface-inverse relative overflow-hidden rounded-4xl px-4 py-7 text-white sm:px-7 lg:p-9">
        <div aria-hidden="true" className="bg-brand-600/30 absolute -top-28 -right-20 size-72 rounded-full blur-3xl" />
```

```tsx
// apps/storefront/src/app/[locale]/(shop)/_lib/components/home/SectionNewArrivals.tsx:15-17 — current
  return (
    <section>
      <div className="container mx-auto px-4 py-(--space-section-new-arrivals) md:py-(--space-section-new-arrivals-lg)">
        <SectionHeading title={t('title')} subtitle={t('subtitle')} ctaLabel={t('viewAll')} ctaHref={`/${locale}/products`} />
```

```tsx
// apps/storefront/src/app/[locale]/(shop)/_lib/components/home/SectionTestimonials.tsx:7-12 — current (Server Component, no 'use client')
  return (
    <section className="bg-muted/50">
      <div className="container mx-auto px-4 py-(--space-section-testimonials) md:py-(--space-section-testimonials-lg)">
        <SectionHeading title={t('title')} align="center" />
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {homeTestimonialsData.map((testimonial) => (
```

```tsx
// apps/storefront/src/app/[locale]/(shop)/_lib/components/home/SectionWhyChooseUs.tsx:9-12 — current (Server Component, no 'use client')
    <section className="border-border border-y py-(--space-section-why-choose-us)">
      <div className="container mx-auto px-4">
        <div className="divide-border grid grid-cols-1 divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
          {homeBenefitsData.map((benefit) => {
```

`SectionTestimonials.tsx` and `SectionWhyChooseUs.tsx` have no `'use client'` directive — they are Server Components today. `SectionFeaturedCategories.tsx`, `SectionBestSellers.tsx`, `SectionFlashSale.tsx`, and `SectionNewArrivals.tsx` already have `'use client'` (they use `useLocale`).

## Target

Create one small shared `Reveal` client primitive (this repo's locked `design.md` motion stance explicitly calls for "1–2 reveal primitives per section, not stacked" — this is that primitive) and wrap **exactly one** block per section in it — the whole content block (heading + grid/carousel together), not a per-card stagger. Because `Reveal` carries its own `'use client'` boundary, `SectionTestimonials.tsx` and `SectionWhyChooseUs.tsx` stay Server Components — only the interactive wrapper crosses the boundary.

```tsx
/* target — new file: apps/storefront/src/app/[locale]/(shop)/_lib/components/common/Reveal.tsx */
'use client';

import { motion, useReducedMotion } from 'framer-motion';

const HIDDEN = { opacity: 0, transform: 'translateY(16px)' };
const SHOWN = { opacity: 1, transform: 'translateY(0px)' };

interface RevealProps {
  readonly children: React.ReactNode;
  readonly className?: string;
}

export function Reveal({ children, className }: RevealProps): React.JSX.Element {
  const prefersReducedMotion = useReducedMotion() === true;

  return (
    <motion.div
      initial={prefersReducedMotion ? SHOWN : HIDDEN}
      whileInView={SHOWN}
      viewport={{ once: true, margin: '-100px' }}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.35, ease: [0, 0, 0.2, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
```

Values used, pulled from this repo's own tokens (`packages/tailwind-config/src/theme.css:135-139`, mirrored in `design.md`):

- Easing: `[0, 0, 0.2, 1]` — the array form of `--ease-out: cubic-bezier(0, 0, 0.2, 1)`, correct per AUDIT.md ("Entering → `ease-out`").
- Duration: `0.35` — matches `--duration-slow: 350ms`, the token this repo already uses for its more deliberate/explanatory transitions.
- Transform via the full string form (`transform: 'translateY(16px)'`), not the `y` shorthand — per AUDIT.md's performance rule, so this new primitive doesn't introduce the same finding flagged for `SectionHero.tsx` in plan 006.
- `translateY(16px)`, not `translateY(0)` from nothing — respects the "never appear from nothing" physicality rule (this is a position offset, not a scale-from-zero, so no `scale()` floor applies here).

Per-section wrapping (six edits, one per file):

```tsx
/* target — SectionFeaturedCategories.tsx:16 */
<Reveal className="container mx-auto px-4 py-(--space-section-categories) md:py-(--space-section-categories-lg)">
  <SectionHeading title={t('title')} subtitle={t('subtitle')} ctaLabel={t('viewAll')} ctaHref={`/${locale}/products`} />
  <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-6">{/* ...unchanged... */}</div>
</Reveal>
```

```tsx
/* target — SectionBestSellers.tsx:15-16 */
<section className="container mx-auto px-4 py-(--space-section-best-sellers)">
  <Reveal>
    <ProductCarousel title={t('title')} ctaLabel={t('viewAll')} ctaHref={`/${locale}/products`}>
      {/* ...unchanged... */}
    </ProductCarousel>
  </Reveal>
</section>
```

```tsx
/* target — SectionFlashSale.tsx:18 */
<Reveal className="bg-surface-inverse relative overflow-hidden rounded-4xl px-4 py-7 text-white sm:px-7 lg:p-9">
  <div aria-hidden="true" className="bg-brand-600/30 absolute -top-28 -right-20 size-72 rounded-full blur-3xl" />
  {/* ...unchanged... */}
</Reveal>
```

```tsx
/* target — SectionNewArrivals.tsx:16 */
<Reveal className="container mx-auto px-4 py-(--space-section-new-arrivals) md:py-(--space-section-new-arrivals-lg)">
  <SectionHeading title={t('title')} subtitle={t('subtitle')} ctaLabel={t('viewAll')} ctaHref={`/${locale}/products`} />
  {/* ...unchanged... */}
</Reveal>
```

```tsx
/* target — SectionTestimonials.tsx:9 */
<Reveal className="container mx-auto px-4 py-(--space-section-testimonials) md:py-(--space-section-testimonials-lg)">
  <SectionHeading title={t('title')} align="center" />
  <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{/* ...unchanged... */}</div>
</Reveal>
```

```tsx
/* target — SectionWhyChooseUs.tsx:11 */
<div className="container mx-auto px-4">
  <Reveal className="divide-border grid grid-cols-1 divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
    {homeBenefitsData.map((benefit) => {
      {
        /* ...unchanged... */
      }
    })}
  </Reveal>
</div>
```

## Repo conventions to follow

- Common, reusable home/shop components live in `apps/storefront/src/app/[locale]/(shop)/_lib/components/common/` alongside `SectionHeading.tsx`, `ProductCard.tsx`, `CategoryCard.tsx`, `ProductCarousel.tsx` — put `Reveal.tsx` there, same PascalCase-file/named-export pattern.
- Import alias style: `import { Reveal } from '@/app/[locale]/(shop)/_lib/components/common/Reveal';` — matches how `SectionFeaturedCategories.tsx:5-6` already imports `CategoryCard`/`SectionHeading`.
- Reduced motion: branch on `useReducedMotion() === true` exactly like `SectionHero.tsx:27` — do not use a CSS `prefers-reduced-motion` media query for this, the rest of the home page's `framer-motion` code uses the JS hook.
- `design.md`'s "Motion stance" section (repo-root `design.md:64-72`) is the locked convention this plan must not violate: `--ease-out` for entrances, one reveal primitive per section, not stacked.

## Steps

1. Create `apps/storefront/src/app/[locale]/(shop)/_lib/components/common/Reveal.tsx` with the exact contents shown in Target above.
2. Edit `SectionFeaturedCategories.tsx`: add the import, replace the `<div className="container mx-auto px-4 py-(--space-section-categories) md:py-(--space-section-categories-lg)">...</div>` wrapper with `<Reveal className="...">...</Reveal>` using the same className string, leaving `SectionHeading` and the grid untouched inside it.
3. Edit `SectionBestSellers.tsx`: add the import, wrap the existing `<ProductCarousel>...</ProductCarousel>` in `<Reveal>...</Reveal>` (no className needed — the `<section>` already carries the layout classes).
4. Edit `SectionFlashSale.tsx`: add the import, replace the `<div className="bg-surface-inverse relative overflow-hidden rounded-4xl px-4 py-7 text-white sm:px-7 lg:p-9">...</div>` wrapper with `<Reveal className="...">...</Reveal>` using the same className string.
5. Edit `SectionNewArrivals.tsx`: add the import, replace the `<div className="container mx-auto px-4 py-(--space-section-new-arrivals) md:py-(--space-section-new-arrivals-lg)">...</div>` wrapper with `<Reveal className="...">...</Reveal>`.
6. Edit `SectionTestimonials.tsx`: add the import (file stays a Server Component — do **not** add `'use client'` to this file), replace the `<div className="container mx-auto px-4 py-(--space-section-testimonials) md:py-(--space-section-testimonials-lg)">...</div>` wrapper with `<Reveal className="...">...</Reveal>`.
7. Edit `SectionWhyChooseUs.tsx`: add the import (file stays a Server Component — do **not** add `'use client'` to this file), replace only the inner `<div className="divide-border grid grid-cols-1 divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">...</div>` (the benefits grid) with `<Reveal className="...">...</Reveal>`, keeping the outer `<div className="container mx-auto px-4">` as a plain `div`.

## Boundaries

- Do NOT touch `SectionHero.tsx`, `HeroCarousel.tsx`, `NewsletterForm.tsx`, or `SectionNewsletter.tsx` — those are covered by separate plans (003, 004) or are out of scope.
- Do NOT add `'use client'` to `SectionTestimonials.tsx` or `SectionWhyChooseUs.tsx` — `Reveal` carries its own client boundary; adding it to the parent files is unnecessary and regresses them from Server to Client Components.
- Do NOT stagger children inside a section (no `staggerChildren`, no per-card `motion.div`) — one `Reveal` per section only, per `design.md`'s "1–2 reveal primitives per section, not stacked."
- Do NOT change any section's markup, copy, or layout classes beyond swapping the one wrapper element for `<Reveal>` with the same className.
- Do NOT add a new animation dependency — `framer-motion` is already installed.
- If a section's JSX structure has changed since commit `30961c2` (drift) such that the cited wrapper `<div>` no longer exists as shown, STOP and report instead of guessing which element to wrap.

## Verification

- **Mechanical**: `pnpm --filter storefront typecheck` and `pnpm --filter storefront lint` both pass with no new errors.
- **Feel check**: load the home page at a fresh scroll position (top of page), then scroll down slowly past each of the six sections:
  - Each section's content (heading + grid/carousel) fades up from `opacity: 0, translateY(16px)` to fully visible as it enters the viewport — it should not be already visible before it scrolls into view, and it should not still be invisible once it's a screen-height past the fold.
  - Scrolling back up and down again does **not** replay the animation (`viewport={{ once: true }}` — confirm in the DevTools Elements panel that the `style` opacity stays at `1` after the first reveal).
  - In DevTools Animations panel, set playback to 10% and scrub one section's reveal: confirm a single ~350ms fade+translateY, not multiple staggered entries.
  - Toggle `prefers-reduced-motion` (Rendering panel) and reload: all six sections' content is visible immediately with no fade or movement.
- **Done when**: all six sections reveal on scroll using the shared `Reveal` primitive, `SectionTestimonials.tsx`/`SectionWhyChooseUs.tsx` remain Server Components, and reduced motion is respected in all six.
