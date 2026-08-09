# Homepage — Current State

Scan-only report (redesign-existing-projects skill, "Scan" step). No code was changed while producing this.
Repo: `apps/storefront` (Next.js App Router, next-intl, Tailwind v4). Branch at time of writing: `fix/ui-review-storefront`.

Note: `SectionHero.tsx` currently has uncommitted local changes (`git status` shows it modified). Everything below reflects the file contents as they exist on disk right now, not the last commit.

---

## 1. Homepage entry point

- **Route:** `apps/storefront/src/app/[locale]/(shop)/home/page.tsx` → `HomePage`.
- **Redirect shim:** `apps/storefront/src/app/[locale]/(shop)/page.tsx` (`/{locale}`) does `redirect(`/${locale}/home`)`. So `/vi` and `/vi/home` both resolve to the same page, with `/home` being canonical.
- **Layout chain wrapping it:**
  - `app/layout.tsx` — root HTML shell, loads the `Be_Vietnam_Pro` font, sets metadata/viewport, wraps in `Providers`.
  - `app/[locale]/layout.tsx` — validates locale (`vi`/`en`, else `notFound()`), calls `setRequestLocale`, wraps in `NextIntlClientProvider` + `Providers`.
  - `app/[locale]/(shop)/layout.tsx` — renders `Header`, `<main>{children}</main>`, `Footer`, and injects a `WebSite`/`SearchAction` JSON-LD script.
- Page component is an async server component; it calls `setRequestLocale(locale)` and conditionally renders one section based on `env.NODE_ENV`.

## 2. Homepage sections

Rendered in this order by `home/page.tsx`:

1. `SectionHero`
2. `SectionFeaturedCategories`
3. `SectionFlashSale`
4. `SectionBestSellers`
5. `SectionNewArrivals`
6. `SectionWhyChooseUs`
7. `SectionTestimonials` — **only when `env.NODE_ENV !== 'production'`**. A code comment states its data (`homeTestimonialsData`) is unverified placeholder copy and must not ship to production until backed by real reviews.
8. `SectionNewsletter`

All section files live in `apps/storefront/src/app/[locale]/(shop)/_lib/components/home/`.

## 3. Components used by the homepage

**Home-specific** (`_lib/components/home/`):

- `SectionHero`, `SectionFeaturedCategories`, `SectionFlashSale`, `SectionBestSellers`, `SectionNewArrivals`, `SectionWhyChooseUs`, `SectionTestimonials`, `SectionNewsletter`
- `CountdownTimer` (used by `SectionFlashSale`, `compact` variant)
- `NewsletterForm` (used by `SectionNewsletter`)
- `TrustBadgeList` (used by `SectionHero`)
- `TestimonialCard` (used by `SectionTestimonials`)

**Shared "common" components** (`_lib/components/common/`) consumed by the homepage:

- `ProductCard` — used by `SectionFlashSale`, `SectionBestSellers`, `SectionNewArrivals`
- `ProductCarousel` — used by `SectionBestSellers` (horizontal scroll-snap track)
- `CategoryCard` — used by `SectionFeaturedCategories`
- `SectionHeading` — used by `SectionFeaturedCategories`, `SectionNewArrivals`, `SectionTestimonials`

Other files in `common/` (`ConfirmDialog`, `FlashSaleBanner`, `HeroBanner`, `OrderStatusBadge`, `Pagination`, `PriceDisplay`, `QuantitySelector`, `ShopLoadingShell`) exist in the same folder but are **not** referenced by any homepage section — they're used by PLP/PDP/checkout/orders instead. Notably `PriceDisplay` (with its shared `calculateDiscountPercent` helper) is not used by `ProductCard`; `ProductCard` re-implements discount math inline (see §12).

**Layout shell** (rendered around every shop page, including home): `Header`, `Footer` (`_lib/components/layout/`), which themselves pull in `CartDrawer`, `DesktopMegaMenu`, `MobileNav`, `useCart`, `useWishlist`, `useAuth`.

**Cross-package UI primitives** (`@repo/ui`): `Button` (cva variants: default/destructive/outline/secondary/ghost/link/primary/danger; sizes default/xs/sm/md/lg/icon variants), `Badge` (cva variants: default/secondary/destructive/outline/ghost/link/warning/info/success/brand).

**Icons:** `lucide-react` throughout (Check, Heart, Star, ChevronLeft/Right, Flame, Search, ShoppingCart, User, LogOut, Mail, Phone, plus dynamic icon lookup by name in `SectionWhyChooseUs`).

**Animation:** `framer-motion` (`motion`, `useReducedMotion`) — only in `SectionHero`.

## 4. Existing design tokens

Two coordinated sources:

- **`packages/design-tokens/src/*.ts`** — plain TS constants (`colors.ts`, `semantic.ts`, `typography.ts`, `spacing.ts`, `motion.ts`, `breakpoints.ts`, `radius.ts`, `shadow.ts`, `z-index.ts`). Comment in `semantic.ts` states components should prefer these semantic tokens over raw `colors.ts` values, but in practice the homepage code below reaches for raw Tailwind color utilities (`bg-neutral-950`, `text-brand-600`, etc.) and CSS custom properties, not these JS exports directly.
- **`packages/tailwind-config/src/{preset.css,theme.css}`** — the tokens that actually drive Tailwind v4 (`@theme` block), imported by `apps/storefront/src/app/globals.css` via `@import '@repo/tailwind-config/preset.css';`. This is a CSS-first Tailwind v4 setup, no `tailwind.config.ts` theme customization (that file only sets `content`/`darkMode: 'class'`, `theme.extend` is empty).
- `preset.css` also defines a custom `@utility container` (see §7) and shadcn-style semantic CSS vars (`--background`, `--foreground`, `--primary`, etc.) for both `:root` and `.dark`.
- `darkMode: 'class'` is configured, `.dark` tokens exist, but no dark-mode toggle UI was found anywhere in Header/Footer/homepage — dark mode is wired at the token layer but not exposed to users yet.

## 5. Typography system

- **Font:** Be Vietnam Pro (Google Font via `next/font/google` in `app/layout.tsx`), weights `400/500/600/700/900`, subsets `latin`+`vietnamese`, exposed as CSS var `--font-be-vietnam-pro`. Per ADR 0003, this single font is used for **both** body and display (`--font-sans` and `--font-display` both resolve to it) — no per-locale font override. `--font-mono` is `JetBrains Mono` but not used anywhere in the homepage.
- **Token scale** (`design-tokens/typography.ts`): `body-sm/md/lg`, `label-sm/md`, `title-sm/md/lg`, `display-sm` — sizes 12–36px with generous line-heights (documented as sized for Vietnamese diacritics/uppercase). **This scale is not wired into Tailwind's `text-*` utilities** — it's a standalone JS export. Homepage components instead use raw Tailwind size utilities directly (`text-5xl`/`6xl`/`7xl`/`8xl` for the hero H1, `text-2xl`/`3xl` for section headings, `text-sm`/`xs` for body/meta), so there's a gap between the documented type-scale tokens and what's actually applied on the page.
- Hero headline styling: `font-display`, `font-black`, `tracking-tighter`, responsive `text-5xl → text-6xl (sm) → text-7xl (md) → text-8xl (lg)`.
- Section headings (`SectionHeading`, inline `<h2>`s): `text-2xl font-bold tracking-tight` (and `text-3xl` in the newsletter section at `md`).
- `tabular-nums` is used for prices, ratings, and countdown digits.

## 6. Color system

All colors defined in OKLCH, in `theme.css`'s `@theme` block (mirrored in `design-tokens/colors.ts`):

- `brand` (hue 25, red-orange) — comment: "chỉ dùng cho giá, sale, badge khuyến mãi" (price/sale/promo badges only). Used on homepage for price text (`text-brand-600`), the Flash Sale badge, discount badges.
- `secondary` (hue 220, blue) — described as "trust" blue; not used directly by homepage sections observed (mapped into `--secondary-foreground`/`--accent-foreground` semantic slots instead).
- `accent` (hue 55, yellow-orange) — feeds `--accent`/`--accent-foreground` semantic tokens; also a separate `accent-600` is used directly for the wishlist-active heart icon fill in `ProductCard`.
- `neutral` (hue 30, warm gray) — the base for `--background`/`--foreground`/`--border`/`--muted` etc., and also used raw for the intentionally-dark Hero (`bg-neutral-950`), Newsletter (`bg-neutral-900`), and Footer (`bg-neutral-950`) sections.
- Feedback colors: `success`, `warning`, `error`, `info` (50/500/700 steps only). Comment flags `warning-500`/others as background/icon-only, `-700` reserved for text to hold WCAG AA contrast.
- Shadcn-style semantic aliases (`--color-background`, `--color-primary`, `--color-border`, …) are generated from the raw `--background`/`--primary`/etc. custom properties set in `preset.css`, with distinct light (`:root`) and dark (`.dark`) values.
- Observation (not fixed here): three homepage sections hard-code a dark `neutral-900/950` background against an otherwise light-token page (Hero, Newsletter, Footer) rather than using a semantic "inverse surface" token — each does its own ad hoc `bg-neutral-950 text-white` / `bg-neutral-900 text-white`.

## 7. Spacing system

- `design-tokens/spacing.ts` documents a 4px-base scale (0 → 128px) "matches Tailwind's default scale" — it exists so non-Tailwind JS consumers stay aligned, but Tailwind's own default spacing scale is what's actually applied via utility classes (`px-4`, `py-8`, `gap-3`, etc.); nothing in `theme.css` overrides Tailwind's spacing scale.
- **Custom `container` utility** (`preset.css`, referenced as FE-ARCHITECTURE.md §16.4.3) redefines Tailwind's `container` class with fixed max-widths per breakpoint instead of the default: `base/sm: 100%` (padding 16px/20px), `md: 720px` (24px), `lg: 960px` (24px), `xl: 1200px` (32px), `2xl: 1280px` (32px). Every homepage section wraps its content in `container mx-auto px-4 ...`, so this custom scale governs all homepage content width.
- Section vertical rhythm is inconsistent across sections (not part of a shared token): `py-8 md:py-10` (categories), `py-10` (flash sale), `py-12` (best sellers), `py-16 md:py-20` (new arrivals), `py-10` (why-choose-us), `py-12 md:py-16` (testimonials), `py-14 md:py-20` (newsletter). Each section picks its own padding rather than pulling from a shared "section spacing" token.

## 8. Responsive behavior

- Breakpoints are Tailwind v4 defaults (`sm 640 / md 768 / lg 1024 / xl 1280 / 2xl 1536`), confirmed unchanged in `design-tokens/breakpoints.ts` (explicitly kept default to avoid touching ~32 existing `sm:` usages, per decision-log.md).
- Grid reflow patterns per section:
  - Featured Categories: `grid-cols-2 → sm:grid-cols-4 → md:grid-cols-6`, with the first category spanning `col-span-2 row-span-2` as a "hero" tile.
  - Flash Sale: `grid-cols-2 → sm:grid-cols-3 → lg:grid-cols-4`.
  - New Arrivals: single column stacked on mobile → `lg:grid-cols-5` (3-col spotlight + 2-col strip), with the strip itself `grid-cols-2 → sm:grid-cols-4 → lg:grid-cols-2`.
  - Why Choose Us: `grid-cols-1 (divide-y) → sm:grid-cols-2 (divide-x) → lg:grid-cols-4`.
  - Testimonials: `grid-cols-1 → sm:grid-cols-2 → lg:grid-cols-4`.
  - Best Sellers: not a CSS grid — a horizontally scrolling flex track; card width is `45% → sm:30% → lg:23%` of the track.
- Hero section height: `min-h-[70vh] → md:min-h-[85vh]` (static viewport unit, not `dvh` — potential mobile browser chrome jump per the redesign skill's audit, noted as an observation only).
- All homepage `<Image>` usages set explicit `sizes` for responsive image loading (e.g. `(max-width: 768px) 50vw, 25vw` on cards, `100vw` on the hero).

## 9. Animations and interactions

- **Hero entrance:** `framer-motion` staggered reveal (`revealUp`: fade + `y:12→0`) on badge/heading-lines/subtitle/CTA row, `staggerChildren: 0.06`. Fully respects reduced motion: `useReducedMotion()` swaps in a no-op `reducedVariant`/`duration:0`, in addition to the global CSS `@media (prefers-reduced-motion: reduce)` block in `preset.css` that zeroes all animation/transition durations site-wide.
- **Hover/press micro-interactions**, all driven by the `--duration-fast/normal/slow` + `--ease-out` tokens from `theme.css`:
  - `ProductCard` / `CategoryCard`: image `group-hover:-translate-y-0.5`, border-color + shadow transition on the card.
  - `ProductCarousel` prev/next buttons: `hover:bg-muted` with `duration-(--duration-fast)`.
  - `Button` (shared): `active:scale-[0.98]` press feedback, transitions on color/background/border/shadow.
- **Carousel mechanics:** `ProductCarousel` is native CSS scroll-snap (`snap-x snap-mandatory`, scrollbar hidden cross-browser), driven by two buttons that call `scrollBy` with a computed step (first card width + 16px gap) — no external carousel library.
- **Countdown:** `CountdownTimer` ticks every 1000ms via `setInterval` inside `useEffect` (cleaned up on unmount); renders an `animate-pulse` skeleton before first client tick (avoids SSR/CSR mismatch flash).
- **Focus handling:** `focus-visible:ring-2` / `ring-offset-2` patterns applied consistently on links/cards/buttons across homepage components (ProductCard, CategoryCard, carousel arrows, Footer links, newsletter input).
- **Newsletter form:** local `submitted` state swaps the form for a success message; no error state, no real submission handler wired at the homepage call site (`onSubmit` prop is optional and unused by `SectionNewsletter`).

## 10. Image and media usage

- All images render through `next/image`.
- Hero: `fill` + `priority` (LCP) background image, `sizes="100vw"`, with `aria-hidden` decorative alt, plus a `bg-linear-to-t from-black/85 via-black/30 to-transparent` scrim overlay for text legibility.
- `CategoryCard` / `ProductCard`: `fill` images inside `aspect-square` / `aspect-[4/5]` containers, with `sizes="(max-width: 768px) 50vw, 25vw"`.
- `TestimonialCard`: fixed `40×40` avatar, sourced from `https://i.pravatar.cc/150?u=...` (external placeholder service) with a local fallback path (`/images/avatars/default.jpg`) if `src` is empty.
- **All current homepage imagery is placeholder**: `homeHeroData.image` → `/images/hero-placeholder.jpg`; category images → `/images/categories/{slug}.jpg`; every product's image → the single shared `/images/products/placeholder.jpg`. None of these are confirmed to exist as real assets — this report doesn't verify the files themselves, only that the code references these paths.

## 11. Existing reusable components (beyond what's wired into home today)

Available in `_lib/components/common/` but unused by the homepage, for context/reuse in future work:

- `PriceDisplay` — has the "correct"/canonical discount-percent-badge rendering (via `calculateDiscountPercent`), duplicated (not reused) by `ProductCard`'s inline price block.
- `HeroBanner`, `FlashSaleBanner` — banner-style components not currently used by any homepage section (`SectionHero`/`SectionFlashSale` each roll their own markup instead).
- `ConfirmDialog`, `OrderStatusBadge`, `Pagination`, `QuantitySelector`, `ShopLoadingShell` — used elsewhere in the shop (cart/checkout/orders/PLP), not homepage-relevant today but part of the same shared vocabulary.
- Shared UI kit (`@repo/ui`): `Button`, `Badge` — both cva-based, already token-driven, safe to keep reusing as-is.

## 12. Existing business logic that must not be broken

- **Locale routing:** every internal link on the homepage is built as `/${locale}/...` via `useLocale()`; the locale segment is validated in `[locale]/layout.tsx` (`vi`/`en` only, `notFound()` otherwise) and the bare `/{locale}` route redirects to `/{locale}/home`.
- **Testimonials production gate:** `SectionTestimonials` is only rendered when `env.NODE_ENV !== 'production'`. This is deliberate — `homeTestimonialsData` is explicitly documented as unverified placeholder copy that must not appear to real users. Any redesign must preserve this gate (or replace the data with a real, sourced testimonial feed before removing it).
- **Wishlist toggle:** `ProductCard`'s heart button reads/writes `useIsWishlisted` → a Zustand store (`useWishlistStore`) persisted to `localStorage` (`wishlist-storage-v1`), with SSR-safe empty initial state and a one-time hydrate-on-mount guard (`hasHydrated` module flag), plus a login-time merge (`mergeWishlistOnLogin`) that unions guest + account wishlists via the API SDK. This is shared logic (also used by the Header wishlist badge/count and the Wishlist page) — not homepage-only, so any homepage restyle touching `ProductCard` must keep calling `useIsWishlisted` correctly (one call per card, keyed by product id).
- **Cart/session logic surfaced via Header** (rendered above every homepage section): `useCart` item count, `useAuth` login state, and a login-triggered merge of both cart and wishlist (`wasAuthenticated` ref guards a "run once on transition to authenticated" effect) — not homepage code per se, but part of what renders on every homepage view and must keep working.
- **Flash sale countdown target:** `useHomeFlashSaleCountdown` computes `targetDate = now + 24h` freshly on every mount — it is **not** sourced from a real backend-configured sale end time. `CountdownTimer` itself is presentational/reusable and correctly generic; the "when does the sale end" business rule is currently a placeholder client-side stub.
- **Discount/price computation:** `hasDiscount = salePrice is a number && 0 < salePrice < price` is duplicated in both `ProductCard` and `PriceDisplay` (slightly differently: `PriceDisplay` additionally computes `discountPercent` via `calculateDiscountPercent`). Any future consolidation of these two components needs to preserve this exact discount predicate and the `formatCurrency` (`@repo/shared/utils`) formatting used for all prices.
- **Structured data:** `ShopLayout` injects `WebSite`/`SearchAction` JSON-LD (`@context`, `url`, `potentialAction.target`) built from `locale` and hard-coded `https://antigravity.store` — must stay accurate to the real domain/search route if the URL or search endpoint ever changes.
- **Accessibility contracts already in place** that a restyle must not regress: `aria-label`/`aria-pressed` on the wishlist toggle, `aria-label` on carousel prev/next and header search open/close, `focus-visible` ring treatment across interactive elements, and the global CSS reduced-motion override in `preset.css` in addition to the hero's own `useReducedMotion` branch.
