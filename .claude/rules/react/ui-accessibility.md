---
paths:
  - 'apps/**/*.tsx'
  - 'packages/ui/**/*.tsx'
  - 'packages/shared/**/*.tsx'
  - '**/*.css'
description: Design-token/CVA usage rules and the accessibility baseline for every screen.
---

# UI, styling and accessibility conventions

## Components and styling

- Reuse a primitive from `@repo/ui` before creating a new control. `packages/ui` contains pure UI only — no business logic or API calls.
- Keep an app/feature-specific component local until there is evidence it should be reused; do not move an abstraction to a shared package too early.
- Use semantic tokens from `packages/tailwind-config`; do not hard-code a color when a matching token exists.
- Use `cn()` to combine conditional classes and CVA when a component has a public variant. Do not hand-concatenate complex class strings.
- The primary CTA uses the `primary` token; `brand` is for price, sale, or promotion; surfaces use a semantic token instead of a default `bg-white`.
- Every data-fetching screen must handle loading, empty, error and success. Loading must not cause a large layout shift; errors should offer a retry or next action when appropriate.
- UI must never display a fake testimonial, rating, customer count, or marketing claim as if it were production evidence.

## Accessibility

- Prefer semantic HTML elements and a clear accessible name; do not turn a `div` into a button/link when the native element would work.
- Every interaction must be usable via keyboard, with a visible focus state and a sensible focus order.
- Inputs must have an associated label; form errors must be described and linked with `aria-describedby` when needed.
- Icon-only buttons need an accessible label; meaningful images need a useful `alt`; decorative images use an empty alt.
- Dialogs, popovers, menus and tooltips should prefer the existing Radix primitives to keep focus management and ARIA correct.
- Motion must respect `prefers-reduced-motion`; never use animation as the only way to convey state.
- Check responsiveness at a minimum of 320, 375, 414, 768 and 1440 px; no horizontal overflow or incorrectly wrapped CTA labels.
