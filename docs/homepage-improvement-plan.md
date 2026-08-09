# Homepage — Improvement Plan

## Implementation status (update)

**18 of 19 items are shipped.** One item — P3-5 — is intentionally not code-implementable; see the note at the end of this section before assuming it's an oversight. Three rounds:

**Round 1 (P0 + P1, 8 items)** — scope and interim-mitigation choices confirmed with the user first:

- P0-1 (fake countdown): implemented the **interim mitigation** — removed the "Hôm nay thôi" badge and `CountdownTimer` from `SectionFlashSale`, rather than waiting on a backend sale-end timestamp.
- P0-2/P1-3 (placeholder imagery): implemented **distinct seeded placeholders** (`placehold.co`, already an allowed `next.config.ts` remote pattern) — every product, category, and the hero now render a different image instead of one shared photo.

**Round 2 (P2 + P3, 9 of 11 items)** — including **P2-1 (Header/Footer chrome)**, which the user first deferred as out-of-whole-shop-blast-radius, then explicitly asked to include after all in a follow-up ("thực hiện hết plan đi"). `DesktopMegaMenu`/`MobileNav`/`CartDrawer` were read first to confirm they don't depend on the header's edge-to-edge layout (mega menu positions off its own trigger; mobile nav/cart are portal-based sheets) before touching `Header.tsx`.

**Round 3 (P3-3 only)** — this item was initially evaluated and deliberately skipped in Round 2 (low value-to-effort ratio, see its section for the original reasoning). The user then asked to implement the entire plan with no exceptions, so it was added: named CSS variables per section matching each section's exact existing padding pair, referenced from each `Section*.tsx`. Zero visual delta, confirmed by re-running the full test suite.

**P3-5 is the one item still not implemented, and it can't be closed by "just doing it":** it asks for real, sourced customer testimonials to replace the current placeholder `homeTestimonialsData`. There is no real testimonial content available in this conversation to substitute — writing plausible-sounding fake reviews would recreate exactly the fabricated-content problem the Hallmark audit flagged and the code's own `showTestimonials` production gate exists to prevent. This is a content/business input this plan cannot supply on its own; it stays open until real testimonials are provided.

Every item below implemented across all three rounds is marked **✅ Implemented** (or **✅ Verified**/**✅ Audited**) in its section header, with what actually shipped noted inline. After the latest round: `npx vitest run` — **274/274 tests passing** across the whole storefront app (not just the files touched here) — and `eslint`/`tsc --noEmit` clean on every touched file.

**Widest-blast-radius change to flag explicitly: P2-5** (neutral color chroma) and the token additions in `packages/tailwind-config` and `packages/design-tokens` are consumed by `admin` and `cms` too via the `@source` imports noted in recent commits — not just `storefront`. The chroma nudge is small (e.g. `oklch(0.1 0.003 30)` → `oklch(0.1 0.005 30)`) and by itself should be visually negligible, but per the plan's own risk note, **a visual smoke-test across admin/cms is recommended before merging**, since that wasn't (and couldn't be) part of this pass's storefront-scoped test run.

---

Sources synthesized:

- [`docs/homepage-current-state.md`](./homepage-current-state.md) — factual inventory of the current homepage implementation.
- The `hallmark audit` run against `apps/storefront/src/app/[locale]/(shop)/home/` (1 critical · 7 major · 4 minor findings).
- Direct re-reading of the current implementation (`home/page.tsx`, `_lib/components/home/*`, the shared `common/*` components it renders, `Header`/`Footer`).

## Priority definitions

| Priority               | Meaning                                                                                         |
| ---------------------- | ----------------------------------------------------------------------------------------------- |
| **P0 — Critical**      | Actively damages trust, credibility, or breaks on real devices. Fix before anything else ships. |
| **P1 — High impact**   | Meaningfully affects conversion, maintainability, or accessibility. Schedule soon.              |
| **P2 — Medium impact** | Quality-of-life / consistency improvements. Worth doing, not urgent.                            |
| **P3 — Nice to have**  | Cosmetic polish or optional cleanup. Do opportunistically.                                      |

**Ground rule applied throughout:** every item below is an in-place edit to existing files — a CSS/class change, a token addition, a data swap, or a narrow component-level refactor. Nothing here proposes a new route, a new macrostructure, or a rewrite of `home/page.tsx`'s section order. See [§5](#5-refine-or-redesign) for why.

---

## P0 — Critical

### P0-1. Flash-sale countdown is not backed by real data — ✅ Implemented (interim mitigation)

> **Shipped:** removed the "Hôm nay thôi" badge and the `CountdownTimer` call from `SectionFlashSale.tsx`, per the user's confirmed choice. `useHomeFlashSaleCountdown.ts` and `CountdownTimer.tsx` were left intact (unused by the homepage now, but still available) for when a real backend sale-end timestamp exists — a code comment in `SectionFlashSale.tsx` points back to this decision so it isn't re-added without real data.

- **Current problem:** `useHomeFlashSaleCountdown` (`_lib/hooks/home/useHomeFlashSaleCountdown.ts:5-12`) computes the countdown target as `now + 24h` on every mount. `SectionFlashSale.tsx:16-25` renders this next to a "Hôm nay thôi" (today only) badge as if it were a real deadline.
- **Why it matters:** Every visitor, at any hour, sees a fresh "~24h left" timer. This presents fabricated urgency/scarcity as a real deadline — a classic dark pattern that risks customer trust and, in some markets, runs against consumer-protection guidance on fake countdown timers. It's also the audit's most consequential finding: it's not a look-and-feel issue, it's a content-honesty issue on the homepage's most conversion-oriented section.
- **Proposed solution:** Either (a) wire the countdown to a real, server-provided sale-end timestamp (requires backend/API support — larger effort, correct long-term fix), or (b) as an interim mitigation, drop the fixed "Hôm nay thôi" claim and the countdown until real data exists, keeping the flash-sale product grid without the fake deadline.
- **Affected component/file:** `_lib/hooks/home/useHomeFlashSaleCountdown.ts`, `_lib/components/home/SectionFlashSale.tsx`, `_lib/components/home/CountdownTimer.tsx` (unaffected internally — it's already correctly generic/presentational; only its caller's data source needs to change).
- **Risk of regression:** Low for the interim mitigation (badge/timer removal is additive-safe). Moderate for the real fix — requires new API/backend contract, so must be scoped as its own workstream and tested against the existing `CountdownTimer` component's `variant="compact"` prop contract, which should not need to change.
- **Type of change:** Structural (data-flow change — where the target date comes from), not visual.

### P0-2. Every product on the homepage shares one identical photo — ✅ Implemented

> **Shipped:** added a small deterministic `placeholderImage(seed, size, label)` helper in `_lib/data/home.ts` that maps each product to a distinct `placehold.co` URL (8-color palette, hashed by seed) instead of the single shared `/images/products/placeholder.jpg`. No component change was needed, as anticipated.
>
> **Bug found and fixed after initial shipping:** the first version of this helper omitted an explicit format, so `placehold.co` served `Content-Type: image/svg+xml` by default — and `next/image`'s Image Optimization API rejects SVG sources unless `dangerouslyAllowSVG` is set in `next.config.ts` (it isn't), so every one of these images would have 400'd in the actual running app. Fixed by inserting a `/png` format segment into the URL (verified via `curl -I` before and after: `image/svg+xml` → `image/png`). This was a real, previously-undetected regression from this plan's own P0-2/P1-3 work — there is no automated test coverage for "does this remote image actually load," so it slipped through `vitest`/`eslint`/`tsc` cleanly. Worth a manual visual check of the homepage once deployed, since this class of bug won't show up in CI.

- **Current problem:** `bestSellersData` and `newArrivalsData` in `_lib/data/home.ts:49-71` (16 entries total) all reference the same `/images/products/placeholder.jpg`. `ProductCard.tsx:79-96` renders whatever `images[0]` is, so Flash Sale, Best Sellers, and New Arrivals all display the identical picture.
- **Why it matters:** This is the single most visible credibility problem on the page. A first-time visitor scanning the homepage sees the same photo repeated a dozen+ times — it reads immediately as a fake or broken catalog, not a real store, regardless of how polished the surrounding layout is.
- **Proposed solution:** Source distinct images per product — real product photography if available, or at minimum visually distinct placeholder images (e.g. seeded placeholder-service URLs per product ID) until real photography is ready. No component change needed — `ProductCard` already renders whatever `images` array it's given.
- **Affected component/file:** `_lib/data/home.ts` (data only — `ProductCard.tsx` needs no change).
- **Risk of regression:** Very low. This is a data-value swap; the rendering path, `sizes` attributes, and `next/image` behavior are untouched.
- **Type of change:** Visual/content (asset swap), not structural.

### P0-3. Footer brand wordmark has no overflow protection at narrow viewports — ✅ Implemented

- **Current problem:** `Footer.tsx:29-31` renders `ANTIGRAVITY.STORE` — one unbroken 18-character string with no space — at `text-3xl md:text-4xl font-black tracking-tighter`, with no `overflow-wrap: anywhere` / `min-width: 0` safety net.
- **Why it matters:** At 320–375px viewport widths (a large share of real e-commerce mobile traffic), the padded footer column is narrower than the rendered word length at that size and weight. There is no natural break point in the string, so this can overflow or visually break the footer layout on real phones — a genuine responsive bug, not just a taste issue.
- **Proposed solution:** Add `overflow-wrap: anywhere; min-width: 0` to the wordmark element, and/or drop its mobile size one step further (e.g. `text-2xl` below `sm`) to give it more margin before the break-point matters.
- **Affected component/file:** `_lib/components/layout/Footer.tsx:29-31`.
- **Risk of regression:** Very low — CSS-only, additive, doesn't touch layout structure, routing, or any other section.
- **Type of change:** Visual refinement (CSS-only).

---

## P1 — High impact

### P1-1. Header search input height doesn't match its adjacent button — ✅ Implemented

- **Current problem:** The search `<input>` in `Header.tsx:85-96` is `h-9` (36px); the "close search" `<Button size="icon">` right beside it in the same row (`Header.tsx:97-108`) resolves to `size-11` (44px) per `packages/ui/src/components/button.tsx:29`.
- **Why it matters:** This is a small but visible misalignment every time a user opens the header search — the input and its adjacent control don't share a baseline height, which reads as unfinished polish on a frequently-used piece of chrome.
- **Proposed solution:** Give the input `h-11` to match the icon button's height (simplest fix), or use `size="icon-sm"` (36px) on the button instead, whichever better matches the surrounding icon-button row (which uses default `size="icon"` elsewhere in the header — matching the input up to `h-11` is the safer choice for visual consistency with the rest of the header's icon buttons).
- **Affected component/file:** `_lib/components/layout/Header.tsx:85-96`.
- **Risk of regression:** Very low — single class change, no logic touched, `handleSearch`/`searchOpen` state untouched.
- **Type of change:** Visual refinement.

### P1-2. Discount/price logic is duplicated between `ProductCard` and `PriceDisplay` — ✅ Implemented (lower-risk variant)

> **Shipped, with a scope adjustment:** rather than swapping `ProductCard` to render `<PriceDisplay>` directly (which would have changed its markup/classes and risked a visual diff across every homepage section plus the PLP), extracted the shared _calculation_ into a new `resolveDiscount(price, salePrice)` in `discount.ts`, and had both `PriceDisplay` and `ProductCard` call it. This eliminates the duplicated business rule — the actual risk this item was written to address — while leaving `ProductCard`'s existing visual output (size, `tabular-nums`, `items-baseline`, the "Từ" price-range prefix) completely untouched. Added unit tests for `resolveDiscount` in `discount.test.ts`.

- **Current problem:** `ProductCard.tsx:64-65,103-109` re-implements `hasDiscount`/`displayPrice` inline instead of using the already-correct `PriceDisplay` component (`common/PriceDisplay.tsx`), which additionally computes a discount-percent badge via `calculateDiscountPercent`. Two parallel implementations of the same business rule exist in the codebase.
- **Why it matters:** Every homepage product card (Flash Sale, Best Sellers, New Arrivals) uses the `ProductCard` copy of this logic, not the canonical one. If the discount rule or formatting ever changes, there's a real risk the two implementations drift — one gets fixed, the other doesn't — producing inconsistent pricing display across the site. This is a maintainability/correctness risk, not just a style nit.
- **Proposed solution:** Refactor `ProductCard` to render `PriceDisplay` internally for its price block instead of duplicating the discount math, preserving `ProductCard`'s existing visual output (size, `tabular-nums`, `text-brand-600`) by passing appropriate `className`/props to `PriceDisplay`.
- **Affected component/file:** `_lib/components/common/ProductCard.tsx:64-65,100-109`, `_lib/components/common/PriceDisplay.tsx` (consumed, not necessarily changed).
- **Risk of regression:** Moderate — `ProductCard` is used across Flash Sale, Best Sellers, and New Arrivals (and likely the PLP/wishlist elsewhere in the app per the current-state report). Any visual mismatch between the two implementations' markup must be checked carefully; recommend a visual diff pass across all three homepage sections after the change, plus checking any other pages that render `ProductCard`.
- **Type of change:** Structural (consolidating two logic paths into one), not purely visual.

### P1-3. Hero and category imagery are still unverified placeholder paths — ✅ Implemented

> **Shipped:** same `placeholderImage()` helper as P0-2 — the hero and all six category images now render distinct `placehold.co` placeholders instead of unverified local paths. Still not real photography (that requires actual assets from the team), but no longer duplicated/unverified placeholders.

- **Current problem:** `homeHeroData.image` (`/images/hero-placeholder.jpg`) and every `homeCategoriesData[].image` (`/images/categories/{slug}.jpg`) in `_lib/data/home.ts:30-47` are placeholder paths whose actual files were not verified to exist as part of this review.
- **Why it matters:** The hero is the first thing every visitor sees; a missing or generic placeholder image there has an outsized effect on first impression relative to its single occurrence. Category tiles are the first real navigation decision point on the page — a poor or missing image there directly affects click-through into the catalog.
- **Proposed solution:** Confirm these asset files exist and are production-appropriate; replace with real hero/category photography (or a curated stock set) before this page goes live for real customers.
- **Affected component/file:** `_lib/data/home.ts:30-47` (data only — `SectionHero.tsx` and `CategoryCard.tsx` need no change).
- **Risk of regression:** Very low — data-value swap only.
- **Type of change:** Visual/content (asset swap).

### P1-4. Low-opacity white footer labels may sit near the contrast floor — ✅ Verified, no change needed

> **Outcome:** computed the actual contrast ratio for `text-white/50` on `bg-neutral-950` (OKLCH `0.10 0.003 30` → sRGB ≈ rgb(15–25,…), blended with 50% white ≈ rgb(135–140,…)) via the WCAG relative-luminance formula: **≈5.2–5.35:1**, comfortably above the 4.5:1 floor for body-scale text. No code change made, per the plan's own "if it passes, no change needed" instruction.

- **Current problem:** `Footer.tsx:40,57,73` uses `text-white/50` for uppercase column headings (`text-xs font-semibold`) and the copyright line, on a `bg-neutral-950` surface.
- **Why it matters:** A rough OKLCH-based estimate puts this pairing close to (not comfortably above) the WCAG 4.5:1 floor required for body-scale text. Given the explicit instruction to preserve existing accessibility, this needs a real contrast-checker verification rather than being left as a guess in either direction.
- **Proposed solution:** Run the actual `(white/50, neutral-950)` pairing through a contrast tool (e.g. axe DevTools or a WCAG contrast calculator). If it fails 4.5:1, bump to `white/60` or higher; if it passes, no change needed — document the result so this doesn't need re-litigating.
- **Affected component/file:** `_lib/components/layout/Footer.tsx:40,57,73`.
- **Risk of regression:** Very low if a change is needed (opacity bump only).
- **Type of change:** Visual refinement (pending verification).

### P1-5. Newsletter form has no styled error state — ✅ Implemented

> **Shipped:** added controlled email validation on submit in `NewsletterForm.tsx`, with an inline `role="alert"` message styled to match the shared `text-destructive text-sm` convention already used by `@repo/ui/form`'s `FormMessage` elsewhere in the app (e.g. `LoginForm`, `RegisterForm`). Added `aria-invalid`/`aria-describedby` on the input, cleared the error as soon as the visitor edits the field again, and kept `type="email"`/`required` as a semantic baseline (form now has `noValidate` so the new inline message — not the browser's native, inconsistent bubble — is what actually surfaces). Extended `NewsletterForm.test.tsx` with 3 new tests (empty submit, malformed submit, error clears on edit); all pre-existing tests still pass unchanged.

- **Current problem:** `NewsletterForm.tsx:37-49` relies entirely on native browser `type="email" required` validation. There is no on-brand, styled inline error message if the visitor submits an invalid address — behavior and appearance vary by browser.
- **Why it matters:** The newsletter form is a lead-generation surface directly on the homepage (`SectionNewsletter`); an inconsistent or missing error state there is a real (if small) conversion and accessibility gap — screen-reader users get inconsistent feedback from native browser validation UI across browsers.
- **Proposed solution:** Add a controlled validation check on submit (or on blur) with an inline, styled error message consistent with the rest of the design system's input states, while keeping the native `type="email"`/`required` attributes as a baseline fallback.
- **Affected component/file:** `_lib/components/home/NewsletterForm.tsx`.
- **Risk of regression:** Low — additive change to an already-isolated, self-contained component with existing tests (`__tests__/NewsletterForm.test.tsx`); extend that test file to cover the new error path.
- **Type of change:** Structural (new state + validation logic), with a visual component attached.

---

## P2 — Medium impact

### P2-1. Header/Footer follow the generic "AI template" nav/footer shape — ✅ Implemented

> **Shipped:** `Header.tsx` — checked `DesktopMegaMenu`/`MobileNav`/`CartDrawer` first (mega menu's dropdown positions off its own trigger `<nav>` via `absolute top-full`, unaffected by the header's own padding; mobile nav and cart are `Sheet` overlays, portal-based, also unaffected) — then changed the header from a full-bleed flat bar to a floating inset bar: the outer `<header>` now only carries `sticky`/padding, the visible rounded (`rounded-2xl`, `shadow-sm`, bordered) surface is an inner `<div>`. Height, sticky offset, z-index token, and every child (search, mega menu, cart, wishlist, login, mobile nav) are untouched.
>
> `Footer.tsx` — restructured from "3 columns of links beside the brand block" into a statement close: the brand wordmark leads at a larger size on its own, with the same utility links + contact info now in one row below a divider instead of competing as equal-weight columns. Every link/destination is unchanged. Now consumes the new `--color-surface-inverse`/`-foreground` token from P2-4 instead of hardcoded `bg-neutral-950 text-white`.
>
> **Follow-up fix:** the header rework left the "Danh mục" mega menu (`DesktopMegaMenu.tsx`) visually out of sync — its dropdown panel used `rounded-xl` + `mt-2`, tuned for the old flush flat bar. At `mt-2`, the panel's top edge landed _inside_ the new bar's own rounded bottom corner instead of floating cleanly below it. Bumped to `rounded-2xl` (matches the bar's radius) + `mt-6` (clears the bar's bottom edge with a real gap). No functional change — same trigger, same categories, same keyboard/hover behavior.

- **Current problem:** `Header.tsx` (wordmark-left + inline links + icon-button row hard-right, full width, sticky, `backdrop-blur`, hairline border) and `Footer.tsx` (columns of links + tiny copyright line + hairline top border, dark background) both closely match the most commonly recognized generic SaaS nav/footer template shape.
- **Why it matters:** Both are fully functional, accessible, and responsive today — this is a brand-differentiation opportunity, not a defect. Low urgency relative to the P0/P1 items above, but worth scheduling as the site's visual identity matures.
- **Proposed solution:** Evolve the nav/footer treatment within the existing component boundaries — e.g. a distinctive nav shape (floating pill, edge-aligned minimal) or a footer that closes the page with more intent (a brand statement, a newsletter-first close) — without changing their functional contract (search, cart, wishlist, login state, JSON-LD, all link destinations).
- **Affected component/file:** `_lib/components/layout/Header.tsx`, `_lib/components/layout/Footer.tsx`.
- **Risk of regression:** Moderate — these are global chrome rendered on every shop page, not just the homepage (`(shop)/layout.tsx`). Any change here must be re-verified across cart, checkout, PLP/PDP, account, and search pages, not just the homepage. Recommend doing this as its own scoped pass with visual regression coverage across the whole shop, not bundled into a "homepage-only" change.
- **Type of change:** Structural (chrome-level component redesign), scoped narrowly to Header/Footer — not a homepage rebuild.

### P2-2. "Why Choose Us" row is the generic icon-tile feature pattern — ✅ Implemented

> **Shipped:** put the icon inline with the heading on one row (icon in a small rounded `bg-muted` badge) with the description flowing below, instead of a bare icon sitting beside a separate stacked text block. Same four `homeBenefitsData` entries, same responsive grid/divider breakpoints, same dynamic icon lookup.

- **Current problem:** `SectionWhyChooseUs.tsx:9-22` renders icon-above-heading-above-two-line-copy, identically repeated across an evenly divided 4-up grid (dividers instead of card borders, but the same underlying shape).
- **Why it matters:** Purely a visual-differentiation concern — the section is accessible, responsive, and functionally fine. Worth a lighter-touch visual refinement rather than a rebuild.
- **Proposed solution:** Vary treatment across the four items (e.g. pull the icon inline with the heading instead of stacked above it, or vary column emphasis) while keeping the same four `homeBenefitsData` entries and the same responsive grid breakpoints.
- **Affected component/file:** `_lib/components/home/SectionWhyChooseUs.tsx`.
- **Risk of regression:** Low — self-contained section, no shared state, no cross-page usage.
- **Type of change:** Visual refinement.

### P2-3. Documented type-scale tokens exist but the homepage doesn't use them — ✅ Implemented (option a)

> **Shipped:** wired the `typography.ts` scale into real Tailwind v4 utilities via `--text-*`/`--text-*--line-height` in `theme.css` (`text-body-sm`, `text-title-lg`, `text-display-sm`, etc. now exist and are usable). Purely additive — no existing homepage heading was migrated to the new utilities in this pass, exactly as the plan's own "adoption is optional/incremental" note anticipated. Font-weight is intentionally not baked into these tokens (pair with a `font-*` utility, matching how the rest of the scale already works).

- **Current problem:** `packages/design-tokens/src/typography.ts` defines a named type scale (`body-sm/md/lg`, `title-sm/md/lg`, `display-sm`, etc.), but no homepage component references it — every heading/hero size is a raw Tailwind utility (`text-5xl`…`text-8xl`, `text-2xl`, `text-sm`) chosen ad hoc per component.
- **Why it matters:** This isn't visibly broken today — the raw utilities happen to produce a reasonable-looking page — but it's design-system debt: the "source of truth" type scale silently isn't the source of truth, which makes future typography changes (e.g. a global size adjustment) require hunting through every component instead of one token file.
- **Proposed solution:** Either (a) wire the documented scale into Tailwind's `text-*` utilities via `@theme` so `text-display-sm` etc. become real utility classes homepage components can adopt incrementally, or (b) if the raw-Tailwind-size approach is intentionally preferred going forward, retire the unused token file to stop the drift. Either resolves the inconsistency; (a) is lower-risk since it's additive.
- **Affected component/file:** `packages/design-tokens/src/typography.ts`, `packages/tailwind-config/src/theme.css` (token wiring); homepage component adoption is optional/incremental, not required in the same pass.
- **Risk of regression:** Low for the token-wiring step alone (additive, no existing class changes). Moderate if/when homepage components are migrated to the new utilities — each migrated heading needs a visual check against its current raw-Tailwind rendering.
- **Type of change:** Structural (design-system/token layer), decoupled from any single homepage component.

### P2-4. Hero/Newsletter/Footer hardcode dark backgrounds ad hoc instead of a shared token — ✅ Implemented

> **Shipped, with one disclosed deviation from "zero visual delta":** added `--color-surface-inverse` (→ `--color-neutral-950`) and `--color-surface-inverse-foreground` (→ pure white) to `theme.css`, and swapped `SectionHero`, `SectionNewsletter`, and `Footer` to reference them. `SectionHero` and `Footer` already both used `neutral-950`, so they're unchanged visually. **`SectionNewsletter` previously used the slightly lighter `neutral-900`** — unifying all three onto one token nudges its background one step darker (OKLCH lightness 0.16 → 0.10), a very subtle, likely-imperceptible convergence, not the literal zero-delta the plan described. Flagging this honestly rather than silently claiming zero delta.

- **Current problem:** `SectionHero.tsx:32` (`bg-neutral-950`), `SectionNewsletter.tsx:5` (`bg-neutral-900`), and `Footer.tsx:25` (`bg-neutral-950`) each independently choose a dark neutral step and pair it with `text-white`, rather than referencing one shared "inverse surface" semantic token.
- **Why it matters:** Not visually broken — the three sections look intentionally cohesive today — but there's no single place to adjust "the dark section treatment" for the whole site; a future tweak (e.g. adding a subtle warm tint) requires editing three files and hoping they stay in sync.
- **Proposed solution:** Introduce a semantic token (e.g. `--color-surface-inverse` / `--color-surface-inverse-foreground`) in `theme.css` mapped to the existing `neutral-950`/`white` values, and swap these three call sites to reference it. Purely a token-source change — the rendered colors stay identical.
- **Affected component/file:** `packages/tailwind-config/src/theme.css`, `_lib/components/home/SectionHero.tsx:32`, `_lib/components/home/SectionNewsletter.tsx:5`, `_lib/components/layout/Footer.tsx:25`.
- **Risk of regression:** Very low — the new token resolves to the exact same OKLCH values already in use; this is a refactor, not a visual change.
- **Type of change:** Structural (token consolidation), zero visual delta by design.

### P2-5. Several neutral color steps read as pure black/white despite documented warm tinting — ✅ Implemented (wider scope than originally scoped)

> **Shipped, scope correction:** the original finding listed steps 50/100/900/950 as under the 0.005 floor; on re-measurement only **50 (0.004), 900 (0.004), 950 (0.003)** actually were — 100 was already 0.006. Bumped those three in `theme.css` and `colors.ts`. **Additionally discovered and fixed during implementation:** `preset.css`'s shadcn-mapping `:root`/`.dark` blocks (`--background`, `--foreground`, `--primary`, `--primary-foreground`, `--ring`, `--card`, `--popover`, etc.) independently **hardcode the same raw values** rather than referencing `--color-neutral-*` — so the neutral-scale fix alone would not have touched `bg-background`/`text-foreground`, which is what most components actually render with. Updated the matching light+dark values there too (light `:root`'s `--background`/`--foreground`/`--primary`/`--ring`/`--card`/`--popover` family, and dark `.dark`'s `--background`/`--primary-foreground`). See the blast-radius note at the top of this document — this touches admin/cms too.

- **Current problem:** `packages/tailwind-config/src/theme.css:41-52` — `neutral-50` (chroma 0.004), `neutral-100` (0.006), `neutral-900` (0.004), `neutral-950` (0.003) all sit below the ~0.005 chroma floor typically needed for a "warm gray" tint to actually register visually, despite the file's own comment describing this as a warm (hue 30°) neutral family.
- **Why it matters:** These four steps feed the page background, and (combined with P2-4) the Hero/Newsletter/Footer dark sections. The intended warm character of the palette is nearly invisible at these specific steps — a subtle but real gap between the documented design intent and what actually renders.
- **Proposed solution:** Nudge these four steps to ≥0.005 chroma at the same hue 30°, keeping lightness values unchanged. This is a token-value tweak in one file; every consumer (homepage and the rest of the app) inherits the fix automatically.
- **Affected component/file:** `packages/tailwind-config/src/theme.css:41-52`, `packages/design-tokens/src/colors.ts:49-61` (keep the two files' values in sync).
- **Risk of regression:** Low but **wide blast radius** — this token file is consumed app-wide (admin, cms, storefront per the `@source` imports noted in recent commits), not just the homepage. Any change here needs a visual smoke-test across the whole app, not just this page, before merging.
- **Type of change:** Visual refinement (token-value only), but structurally shared — flag for review beyond just the homepage.

### P2-6. Hero uses `min-h-[…vh]` instead of `dvh` — ✅ Implemented

- **Current problem:** `SectionHero.tsx:32` uses `min-h-[70vh] md:min-h-[85vh]` — static viewport-height units.
- **Why it matters:** On iOS Safari, the browser chrome (address bar) show/hide behavior can cause `vh`-based heights to visibly jump as the user starts scrolling. `dvh` (dynamic viewport height) avoids this. Minor but real mobile-polish gap on the page's most prominent section.
- **Proposed solution:** Swap to `min-h-[70dvh] md:min-h-[85dvh]`.
- **Affected component/file:** `_lib/components/home/SectionHero.tsx:32`.
- **Risk of regression:** Very low — one utility swap; verify visually on iOS Safari and at least one older Android browser that may not support `dvh` (very rare at this point, but worth a quick check given `browserslist`/target support).
- **Type of change:** Visual refinement.

---

## P3 — Nice to have

### P3-1. Placeholder-pattern product names — ✅ Implemented

> **Shipped:** replaced the sequential `"Sản phẩm bán chạy {n}"`/`"Hàng mới về {n}"` generator with two fixed lists of 8 plausible, distinct apparel/accessory product names each (matching the existing category set — áo, quần, giày, túi, phụ kiện), with hand-picked slugs to match.

- **Current problem:** `_lib/data/home.ts:51,63` — `"Sản phẩm bán chạy 1"` … `"8"`, `"Hàng mới về 1"` … `"8"` are sequential templated names.
- **Why it matters:** Low visibility relative to the P0 duplicate-image issue, but the same "looks like demo data" signal. Testimonial names elsewhere in the same file (`Nguyễn Thị Lan`, `Trần Văn Minh`, etc.) are already realistic — products should match that bar.
- **Proposed solution:** Give each demo product a plausible, distinct name once real catalog data isn't yet available.
- **Affected component/file:** `_lib/data/home.ts:49-71`.
- **Risk of regression:** None — data-only.
- **Type of change:** Visual/content.

### P3-2. Footer link hover has no transition — ✅ Implemented

> **Shipped as part of the P2-1 Footer rework** — the restructured footer's link markup now includes `transition-colors duration-(--duration-fast)`, matching the rest of the page's hover discipline.

- **Current problem:** `Footer.tsx:44-49` — `hover:text-white` with no `transition-colors`, so the color change is instant rather than eased, unlike nav links elsewhere (`Header.tsx:65`) and `ProductCard`/`ProductCarousel` hover states which all use `transition-colors duration-(--duration-fast/normal)`.
- **Why it matters:** Tiny inconsistency, only noticeable on close inspection.
- **Proposed solution:** Add `transition-colors duration-(--duration-fast)` to match the rest of the page's hover discipline.
- **Affected component/file:** `_lib/components/layout/Footer.tsx:44-49`.
- **Risk of regression:** None.
- **Type of change:** Visual refinement.

### P3-3. Section vertical rhythm isn't formalized into a shared spacing token — ✅ Implemented (on explicit user request)

> **Outcome:** initially evaluated and deliberately skipped (see the reasoning kept below), because each section's padding is a distinct two-value responsive pair and formalizing it is pure renaming, not consolidation. The user then explicitly asked for the full plan with no exceptions, so it was implemented as originally scoped: one named CSS variable pair per section (`--space-section-categories`/`-lg`, `--space-section-flash-sale`, `--space-section-best-sellers`, `--space-section-new-arrivals`/`-lg`, `--space-section-why-choose-us`, `--space-section-testimonials`/`-lg`, `--space-section-newsletter`/`-lg`) added to `theme.css`, referenced from each `Section*.tsx` via `py-(--space-section-*)`. **Exact same pixel values as before in every section** — confirmed zero visual delta this time, unlike P2-4's Newsletter convergence. `npx vitest run` (274/274) and `eslint` re-confirmed clean after this change.
>
> Original skip rationale, kept for context: "Each homepage section's padding is a different two-value responsive pair (e.g. `py-8 md:py-10` vs. `py-16 md:py-20`), not a single scalar — formalizing that into named tokens would mean either inventing paired mobile/desktop tokens for each of 7 distinct pairs (pure renaming, zero consolidation of the actual design decision)... Given the effort-to-value ratio, this was left alone rather than adding tokens purely for the sake of having done something." That assessment of the _value_ of this change hasn't changed — it's now done because the user asked for it directly, not because new information changed the cost/benefit call.

- **Current problem:** Each homepage section picks its own `py-*` value independently (`py-8 md:py-10`, `py-10`, `py-12`, `py-16 md:py-20`, etc. — see current-state report §7).
- **Why it matters:** This is presented as an observation, not a defect — the resulting variety is actually good practice (avoids the "every section padded identically" tell). Only worth formalizing into named tokens (`--space-section-sm/md/lg`) if the team wants a documented rationale for _why_ each section uses the padding it does, for future consistency as more sections get added.
- **Proposed solution:** Optional. If pursued, introduce 2–3 named "section padding" tokens matching the existing values (not new values) and have each section reference one, purely for documentation/consistency purposes.
- **Affected component/file:** All `_lib/components/home/Section*.tsx` files (touch point only, no value changes).
- **Risk of regression:** Low if values are preserved exactly; this is optional and can be skipped entirely without any downside.
- **Type of change:** Structural (token formalization), zero visual delta by design.

### P3-4. Unused reusable components (`PriceDisplay` consumption aside, `HeroBanner`, `FlashSaleBanner`) aren't wired into the homepage — ✅ Audited, no consolidation

> **Outcome:** read both components and grepped for usages app-wide — **neither is referenced anywhere outside its own file.** Both are built on `useTranslations('home')` (next-intl i18n message keys: `home.hero.*`, `home.flashSale.*`), a fundamentally different data source from `SectionHero`/`SectionFlashSale`'s hardcoded `homeHeroData` object and literals — `HeroBanner` also has no real hero image (a plain color-block placeholder, no `next/image`) and no trust badges; `FlashSaleBanner` is a slim CTA strip, not a product grid. These are leftovers from an earlier i18n-based design iteration, not a genuine fit for today's `SectionHero`/`SectionFlashSale`. Per the plan's own instruction ("don't force a merge that doesn't fit"), **left both files as-is, no consolidation, no deletion** (removing dead code wasn't asked for).

- **Current problem:** `common/HeroBanner.tsx` and `common/FlashSaleBanner.tsx` exist in the shared component folder but aren't used by `SectionHero`/`SectionFlashSale`, which each roll their own markup instead.
- **Why it matters:** Not a defect — these components may exist for other pages (PLP banners, promo pages) rather than being homepage-specific. Worth a quick check on whether consolidating would reduce duplication, but not worth forcing if the components' shape doesn't actually fit the homepage's specific hero/flash-sale needs.
- **Proposed solution:** Audit whether `HeroBanner`/`FlashSaleBanner` genuinely overlap with `SectionHero`/`SectionFlashSale`'s needs. If yes, consolidate. If the components serve a different use case (e.g. a smaller inline promo banner on the PLP), leave them as-is — don't force a merge that doesn't fit.
- **Affected component/file:** `_lib/components/common/HeroBanner.tsx`, `_lib/components/common/FlashSaleBanner.tsx`, `_lib/components/home/SectionHero.tsx`, `_lib/components/home/SectionFlashSale.tsx`.
- **Risk of regression:** Low if the audit concludes "leave as-is" (no change). Moderate if consolidation is pursued — would touch two homepage sections' markup.
- **Type of change:** Structural, and explicitly optional — only pursue if the audit in the proposed solution finds a genuine fit.

### P3-5. Dev-only testimonials use placeholder quotes — ⏳ Still open — blocked on real content, not code

> **Outcome:** the only item in this plan that remains unimplemented. Asked to "do everything" including this one — but there is no real testimonial content available to substitute, and inventing plausible-sounding fake reviews to close this out would be the exact fabricated-content problem this section's own production gate (and the Hallmark audit) exists to prevent. This isn't a skipped chore; it's a real input this plan genuinely cannot supply. Provide real, sourced customer testimonials and this becomes a one-line data swap plus removing the `showTestimonials` gate below.

- **Current problem:** `homeTestimonialsData` (`_lib/data/home.ts:78-111`) is explicitly documented in-code as unverified placeholder copy, and `SectionTestimonials` is already gated to render only when `env.NODE_ENV !== 'production'` (`home/page.tsx:18,28`).
- **Why it matters:** This is _not_ a live defect — the codebase already protects against shipping fabricated testimonials to real users, which is the correct behavior. Listed here only as a forward-looking note: once real, sourced customer reviews exist, swap the data and remove the production gate.
- **Proposed solution:** No immediate action required. When real testimonials are available, replace `homeTestimonialsData` with sourced content and remove the `showTestimonials` gate in `home/page.tsx`.
- **Affected component/file:** `_lib/data/home.ts:78-111`, `home/page.tsx:18,28`.
- **Risk of regression:** None today (informational only).
- **Type of change:** Content/business decision, not a code change at this time.

---

## Summary

_(Updated to reflect what actually shipped — 17 of 19 items implemented, 2 deliberately skipped with rationale, see [Implementation status](#implementation-status-update) at the top.)_

### 1. What we kept

- **The section macrostructure and order** — Hero → Featured Categories → Flash Sale → Best Sellers → New Arrivals → Why Choose Us → Testimonials (dev-gated) → Newsletter. Untouched: no section was added, removed, or reordered. This was, and remains, a sound, conversion-oriented information architecture for an e-commerce homepage.
- **All business logic**: locale-prefixed routing and the `/{locale}` → `/{locale}/home` redirect; the testimonials production gate; the wishlist Zustand store + localStorage persistence + login-merge flow (`useIsWishlisted`, `mergeWishlistOnLogin`); cart/auth state surfaced through `Header` (`useCart`, `useAuth`, merge-on-login) — the header rework only changed its outer visual container, none of this logic. The discount predicate (`hasDiscount`) is now one implementation (`resolveDiscount`) instead of two, with identical results.
- **API integration points** — no homepage section's data-fetching behavior changed; only _what_ data it's given (placeholder images, product names) or how one internal calculation is shared (`resolveDiscount`).
- **SEO** — the `WebSite`/`SearchAction` JSON-LD in `(shop)/layout.tsx`, `next/image` usage with `priority`/`sizes` on the hero, and metadata in the root layout — untouched.
- **Analytics** — no tracking/analytics call sites exist on the homepage; none were touched.
- **Accessibility** — existing `focus-visible` ring treatment, `aria-label`/`aria-pressed` on the wishlist toggle, `aria-label` on carousel controls and header search, and reduced-motion handling are all preserved. The newsletter form gained _more_ accessible error semantics (`aria-invalid`, `aria-describedby`, `role="alert"`) than it had before; nothing regressed.
- **Responsive behavior** — the breakpoint system, custom `container` utility, and per-section grid reflow patterns are untouched. The footer wordmark and header input-height fixes are additive; the header's new floating-bar treatment keeps the exact same internal flex layout and breakpoints.
- **Reusable components** — `Button`, `Badge`, `ProductCard`, `ProductCarousel`, `CategoryCard`, `SectionHeading` all kept their current props/contracts. `ProductCard`'s only change is an internal implementation swap (discount calculation), invisible to callers — confirmed via its existing test suite passing unchanged.
- **Performance optimizations** — `next/image` `fill`/`sizes`/`priority` usage, the native CSS scroll-snap carousel, and the framer-motion-only-on-hero entrance are all untouched.

### 2. What we improved

- **Content honesty**: removed the fake flash-sale countdown/badge (P0-1) and replaced the single duplicated product photo with distinct placeholders across all 16 products, 6 categories, and the hero (P0-2/P1-3).
- **Token consistency**: wired the documented type scale into real Tailwind utilities (P2-3), introduced a shared inverse-surface token consumed by all three dark sections (P2-4), and nudged the near-zero-chroma neutral steps — in both the base scale _and_ the previously-out-of-sync `preset.css` shadcn mapping that actually drives `bg-background`/`text-foreground` (P2-5).
- **Small responsive/visual bugs**: fixed the footer wordmark overflow risk (P0-3), the header search input/button height mismatch (P1-1), and the hero's `vh`→`dvh` swap (P2-6).
- **Component consolidation**: `ProductCard` and `PriceDisplay` now share one `resolveDiscount()` calculation instead of two independent implementations (P1-2).
- **Form completeness**: the newsletter signup now has a styled, accessible inline error state instead of relying solely on inconsistent native browser validation (P1-5).
- **Brand differentiation**: evolved the Header into a floating inset bar and the Footer into a statement close instead of the generic wordmark-left/inline-links/icon-row-right nav and columns-of-links footer (P2-1); gave "Why Choose Us" an icon-inline-with-heading treatment instead of the generic icon-tile shape (P2-2).
- **Demo data quality**: replaced sequential placeholder product names with plausible, distinct ones (P3-1); added the missing hover transition on footer links (P3-2, shipped as part of the P2-1 rework).
- **Verified, no change needed**: the footer's low-opacity label contrast clears WCAG AA (~5.2–5.35:1) (P1-4). Audited `HeroBanner`/`FlashSaleBanner` and confirmed they're a genuinely different (i18n-based, unused) implementation, not a consolidation candidate (P3-4).

### 3. What we removed

- **The duplicated discount/price calculation** in `ProductCard` — removed in favor of one shared `resolveDiscount()` used by both `ProductCard` and `PriceDisplay`.
- **The ad hoc, independently-chosen dark background/text-color pairs** in `SectionHero`, `SectionNewsletter`, and `Footer` — removed in favor of one shared `--color-surface-inverse` token (see P2-4's disclosed minor visual convergence on `SectionNewsletter`).
- **The unverified, hardcoded 24-hour countdown target and its "Hôm nay thôi" claim** — removed from `SectionFlashSale` per the confirmed interim mitigation; `CountdownTimer`/`useHomeFlashSaleCountdown` themselves were **not** deleted, only unused for now, pending real backend data.
- **The single shared placeholder product photo** — no longer referenced anywhere; every product/category/hero image path is now distinct.
- Nothing else was deleted. `HeroBanner`/`FlashSaleBanner` were audited (P3-4) and deliberately left in place, unused — removing dead code wasn't asked for.

### 4. What we redesigned

Per the brief, "redesign" was reserved for the pieces where the current shape was genuinely the generic template — everything else in this plan was a refinement:

- **`Header` navigation chrome** (P2-1) — evolved from a full-bleed flat bar to a floating inset bar, with every functional behavior (search, cart drawer, wishlist count, login state, mega menu, mobile nav) fully preserved and verified safe beforehand by reading `DesktopMegaMenu`/`MobileNav`/`CartDrawer`.
- **`Footer` chrome** (P2-1) — evolved from columns-of-links + tiny copyright into a brand-statement close, with every link destination and utility grouping preserved.
- **`SectionWhyChooseUs` icon-row** (P2-2) — the one homepage _section_ whose visual treatment was generic enough to warrant reshaping its layout (not its content or data).

Everything else implemented in this plan was a refinement of the existing implementation, not a redesign — consistent with the original recommendation.

### 5. Refine or redesign?

**Refine — and that's what was executed.** The homepage's information architecture and macrostructure were sound from the start and were never touched: no section was added, removed, or reordered; no route, no macrostructure rewrite. **18 of 19 items** were delivered as **in-place edits to existing files** — CSS/class changes, token additions, data swaps, and two narrowly-scoped chrome redesigns (Header/Footer) that preserved every functional contract. The 19th (P3-5, real testimonials) stays open because it requires real content this plan cannot invent without recreating the exact fabrication problem it was written to fix. All 274 storefront tests pass, lint and typecheck are clean, and the one wide-blast-radius change (P2-5's token edits, shared with admin/cms) is called out explicitly for a follow-up visual smoke-test outside this pass's scope. There was no point at which a rebuild was warranted.
