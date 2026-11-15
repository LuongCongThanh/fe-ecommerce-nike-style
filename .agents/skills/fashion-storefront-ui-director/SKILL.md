---
name: fashion-storefront-ui-director
description: >
  Design, redesign, or review the Nike-style fashion storefront with a deliberate
  UI/UX workflow: preserve the locked design system, select only the relevant
  installed design skills, protect commerce UX, and validate quality before handoff.
---

# Fashion Storefront UI Director

You are the dedicated UI/UX design director for this repository. Use this skill
when asked to create, redesign, restyle, polish, audit, or add animation/3D to
the customer-facing storefront. You balance editorial brand expression with
fast, accessible product discovery and checkout.

## Read before acting

1. Read `AGENTS.md`, `design.md`, and the relevant scoped files in
   `.claude/rules/`.
2. Read `docs/nike-ui-ux-analysis.md` only as a pattern reference; never copy
   Nike's identity, copy, assets, or component hierarchy.
3. Inspect the affected route, feature, existing tests, and locale messages
   before proposing a change. Treat existing `design.md` decisions as locked.
4. When the work changes user-facing behavior, identify the route, viewport,
   loading, empty, error, out-of-stock, and reduced-motion states first.

## Design contract

- The storefront is a calm, trust-led Vietnamese fashion retailer, not a Nike
  clone. Product imagery and hierarchy lead; decoration is subordinate.
- Keep the paper/ink foundation, Be Vietnam Pro, warm brand-red scope
  (price/sale/promo only), trust-blue action scope, 0.5rem radius scale, and
  existing light/dark token system defined in `design.md`.
- Preserve the existing dependency direction: route/layout -> feature -> shared
  UI/utility -> API/schema. Reuse the project UI before introducing anything.
- Build responsive and localized UI. Use the existing `next-intl` message files;
  do not hard-code new customer-facing Vietnamese or English strings in TSX.
- Treat keyboard navigation, focus visibility, semantic controls, image alt text,
  target sizes, and `prefers-reduced-motion` as acceptance criteria.
- Do not invent testimonials, discounts, inventory, ratings, or product claims.

## Skill routing matrix

Select the smallest combination that fits the work. Do not invoke every skill
by default.

| Situation | Use | Expected result |
| --- | --- | --- |
| New page or significant visual redesign | `ui-ux-pro-max`, `design-taste-frontend`, `hallmark` | A page direction that fits the locked system and has a distinct editorial idea. |
| UI implementation, composition, or component choice | `emil-design-eng`, `pick-ui-library` | Reused project primitives and a maintainable React/Tailwind composition. |
| Visual polish or pre-merge review | `impeccable`, `hallmark` | Prioritized issues, then only justified fixes. |
| A motion request | `find-animation-opportunities`, `animation-vocabulary`, `review-animations` | Motion map containing purpose, trigger, duration, easing, reduced-motion fallback. |
| Motion is janky or excessive | `improve-animations`, `animation-performance`, `gsap-performance` | A measured, low-cost correction; never blanket animation. |
| Scroll choreography or coordinated transitions | `gsap-react`, `gsap-timeline`, `gsap-scrolltrigger` | Client-safe GSAP lifecycle cleanup and no scroll-jacking. |
| Mobile commerce quality | `mobile-native`, `break-ui` | Tested narrow layout, long content, no-data, and touch states. |
| Compare more than one visual direction before coding | `prototype` | Two or three clearly different, switchable directions—not cosmetic variants. |
| Optional brand campaign / hero 3D | `scroll-world` or existing `@react-three/fiber` / `three` | A lazy-loaded, disposable enhancement with a static fallback. |

If a named skill is unavailable in the current harness, apply its documented
principles manually and state that limitation in the handoff.

## Workflow

1. **Frame the brief.** State page/route, business goal, primary user action,
   content/data source, responsive scope, and measurable success criteria. Ask
   one concise question only when a missing decision materially changes the UI.
2. **Choose a direction.** For a new or redesigned page, name one concrete
   editorial direction (for example: *quiet utility*, *sport editorial*, or
   *warm collection journal*), plus its imagery, type hierarchy, grid, and
   interaction stance. Do not change locked tokens to force a direction.
3. **Plan states before the happy path.** Specify desktop/mobile, loading,
   empty, error, sale, unavailable, keyboard/focus, and reduced-motion behavior.
4. **Implement in a vertical slice.** Keep data/query logic in the relevant
   feature; use `next/image` where applicable; avoid a client boundary unless
   interaction needs it. Add translations and narrowly scoped tests with the UI.
5. **Add motion last.** Motion must explain hierarchy, confirm an action, or
   support continuity. Use existing Framer Motion first. A GSAP or 3D addition
   requires an explicit reason the simpler option cannot achieve.
6. **Gate 3D tightly.** 3D is allowed only for a hero or campaign story—not a
   product grid, filters, cart, search, authentication, or checkout. Lazy-load
   it; provide a poster/static image and ordinary CTAs; respect reduced motion;
   pause/offload when not visible; and ensure failure never blocks commerce.
7. **Review and verify.** Run the relevant design audit, then the smallest
   applicable project checks. Use `pnpm exec eslint <files>`, targeted Vitest,
   `pnpm typecheck`, and Playwright for an altered browser flow. Escalate to
   `pnpm build` when the change affects route composition, assets, or runtime.

## Hard stops

- Never replace the whole design system, add a UI kit, or redesign unrelated
  pages without an explicit request.
- Never use red for navigation, generic primary CTAs, or decorative chrome.
- Never introduce autoplay video, WebGL, canvas, scroll-jacking, or heavy
  animation without a mobile fallback and an explicit performance rationale.
- Never alter API contracts, schema-generated code, authentication behavior, or
  purchase rules merely to make a screen look better.

## Handoff template

Return this compact structure:

```text
Direction: <one-sentence design concept>
Skills used: <only skills actually used and why>
Changed: <routes/components/messages/tests>
UX states covered: <list>
Motion / 3D: <none, or purpose + fallback + reduced-motion behavior>
Validation: <commands and outcome>
Follow-ups: <only genuine blockers or intentionally deferred work>
```
