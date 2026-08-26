# Design — fe-ecommerce-nike-style

Locked design system. Future Hallmark runs read this file first; pages defer
to it. Amend intentionally — the file is the rule.

Source: extracted from the team's own decided tokens in
`packages/tailwind-config/src/theme.css` + `preset.css` (already wired into
storefront/admin/cms via `@repo/tailwind-config`). Not a fresh Hallmark
build — this file documents an existing, in-production system so future runs
don't drift from it.

## System

- Genre · e-commerce retail (closest Hallmark genre: playful/consumer, but team
  voice is calmer/trust-led than typical playful — treat as its own genre)
- Macrostructure · Home Catalogue Stack — Hero → Featured Categories →
  Flash Sale → Best Sellers → New Arrivals → Why Choose Us → Testimonials
  (dev-only, no verified copy yet) → Newsletter. See
  `apps/storefront/src/app/[locale]/(shop)/home/page.tsx`.
- Theme · custom (vibe: "cam-đỏ tin cậy, ấm, thương mại" — warm neutral base,
  red-orange reserved for price/sale, blue for trust)
- Axes · light (paper L≈98%) / neutral-sans-grotesque / warm-red (hue 25,
  scoped) + trust-blue (hue 220) as a second anchor

## Tokens (canonical · `packages/tailwind-config/src/theme.css` is the source of truth)

```css
:root {
  --color-background: oklch(0.98 0.004 30); /* paper */
  --color-foreground: oklch(0.16 0.004 30); /* ink */
  --color-border: oklch(0.92 0.008 30); /* rule */
  --color-brand-500: oklch(0.62 0.23 25); /* accent — price/sale/badge ONLY, never chrome */
  --color-secondary-500: oklch(0.57 0.2 220); /* trust blue — links, secondary CTA */
  --color-accent-500: oklch(0.72 0.22 55); /* tertiary amber-orange, sparse */
  --color-ring: oklch(0.16 0.004 30);

  --font-sans: var(--font-be-vietnam-pro), sans-serif; /* display + body, one family — decided */
  --font-display: var(--font-be-vietnam-pro), sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --duration-fast: 120ms;
  --duration-normal: 200ms;
  --duration-slow: 350ms;

  --radius: 0.5rem; /* --radius-sm/md/lg/xl derive from this */
}
```

Dark mode is a first-class `.dark` variant (not an afterthought) — see
`preset.css` for the full paired scale.

## CTA voice

- Primary · solid fill, `--primary` (near-black on light / near-white on
  dark) · `--radius-lg` · standard button padding
- Secondary / sale · outline or `--color-brand-*` fill, reserved strictly
  for price, sale badges, and promo — never for structural chrome (nav,
  primary CTA elsewhere)
- Trust actions (account, checkout confidence) lean on `--color-secondary-*`
  blue, not the brand red

## Motion stance

- framer-motion is installed and in active use — 1–2 reveal primitives per
  section, not stacked
- `--ease-out` for entrances, `--ease-spring` reserved for playful confirms
  (add-to-cart, favourite)
- Reduced-motion fallback already wired at the base layer: all animation/
  transition durations collapse to 0.01ms under `prefers-reduced-motion:
reduce` (see `preset.css` `@layer base`)

## Notes

- The brand red (hue 25) has a hard scope rule the team already enforced in
  comments: price / sale / promo badges only. Do not let it leak into nav,
  primary buttons, or link color — that's what `--color-secondary` (blue)
  and `--foreground` (ink) are for.
- `SectionTestimonials` renders placeholder copy with no verified customer
  source — it is explicitly gated off in production (`NODE_ENV !==
'production'`). Do not treat that placeholder copy as real content to
  reuse elsewhere.
- A Nike.com reference was studied for structural inspiration (catalogue
  hero + carousel rhythm, N9 nav, Ft3 footer) but its DNA (Helvetica-style
  condensed display, neutral-only accent) was intentionally NOT adopted —
  it conflicted with this project's already-decided Be Vietnam Pro + brand-
  red-scoped-to-sale system. Kept for reference only, not merged.

## Variants

- **`apps/admin` login page** — explicit, user-approved exception to the brand-red
  scope rule above. The page uses `--color-brand` as its dominant decorative-pane
  accent (gradient blobs + a CSS 3D rotating prism, studied from a fashion-
  e-commerce login reference) instead of `--color-secondary`. This is a
  single-page override, not a system change — every other admin/cms/storefront
  surface keeps brand red scoped to price/sale/promo only. Typography is
  unchanged — still the single Be Vietnam Pro family from `## System` above; the
  user explicitly declined adding a second display face for this page.

## Exports

`theme.css` / `preset.css` (in `packages/tailwind-config`) are the source of
truth, already exported as Tailwind v4 `@theme` + shadcn/ui CSS variables.
For a DTCG `tokens.json`, ask *"extend design.md with DTCG export"`—
Hallmark will append it per`export-formats.md`.
