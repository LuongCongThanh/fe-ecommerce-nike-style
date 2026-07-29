# Technical Design

Generated from the repository state on July 29, 2026.

## 1. Current Architecture

- The repository at `E:\my-pj\FE` is currently documentation-first. As of July 29, 2026 it contains `.idea` and `docs`, but no `apps/` or `packages/` implementation scaffold yet.
- The authoritative documentation layers are:
  - `00-core`: requirements, glossary, ADRs, decision log
  - `01-delivery`: release, security, traceability, summarized architecture
  - `99-reference`: context and reference material only
- The current architecture detail is summarized in two extensionless files:
  - `01-delivery/architecture/frontend`
  - `01-delivery/architecture/backend`
- Many traceability links point to more granular frontend or backend design files that are not present in this checkout. This is a documentation gap, not implemented architecture.

## 2. Proposed Architecture

- Target architecture is a Turborepo monorepo with:
  - `apps/storefront`
  - `apps/admin`
  - `apps/cms`
  - `packages/design-tokens`
  - `packages/ui`
  - `packages/commerce`
  - `packages/schemas`
  - `packages/api-sdk`
  - `packages/hooks`
  - `packages/utils`
  - shared config packages
- Design principles already documented:
  - foundation-first
  - mock-first
  - contract-first
  - shared schemas and API envelope
  - server-enforced authorization

## 3. Frontend Design

- `storefront` is the public customer app with locale-aware routing and localized content output.
- `admin` is the internal operations app with Vietnamese-only UI.
- `cms` is the internal content app with Vietnamese-only UI and localized content-entry fields.
- Shared FE concerns:
  - design tokens with a single typography token set across locales
  - UI primitives in shared packages
  - commerce-specific components shared where justified
  - URL state for PLP browse flows
  - TanStack Query-style server-state ownership and lightweight client-state ownership
- `[Assumption]` The eventual implementation will follow the monorepo structure documented in the brainstorm session and decision log because no code scaffold exists yet.

## 4. Backend Design

- Backend is intentionally not implemented yet.
- Existing delivery docs describe a phased backend roadmap:
  - foundation
  - identity and customer
  - catalog
  - inventory
  - cart and wishlist
  - checkout and order
  - Admin and CMS APIs
  - testing, security, observability
  - frontend integration
- Proposed backend shape is still open at the technology level.
- Confirmed backend-level constraints:
  - auth should align to `httpOnly` session-cookie strategy
  - API responses should follow a shared envelope
  - server should enforce permissions, CSRF strategy, rate limits, audit trails, and sanitize public content

## 5. API Contracts

- API contracts are expected to be defined first in `packages/schemas`.
- Contract properties already documented:
  - stable request and response shapes
  - stable error envelope
  - support for filter, sort, pagination
  - auth and authorization responses aligned with FE expectations
  - real API and mock API must preserve the same contract
- `[Question]` Exact endpoint inventory is referenced by traceability docs but not fully present in this checkout.

## 6. Data Model

- Data model elements explicitly documented:
  - Locale, Default Locale, Localized Text, Market
  - Product, Variant, SKU, Category, Gender
  - CartItem, Reservation, Order, OrderItem
  - WishlistItem
  - Return and refund concepts for COD
- Rules already fixed:
  - price and stock belong to SKU
  - wishlist references Product
  - cart references SKU
  - order items snapshot data
  - return window is seven days

## 7. Data Flow

- Browse flow: route state -> query contract -> list or empty or error render.
- PDP flow: product data -> variant selection -> resolved SKU -> cart action.
- Authenticated merge flow: guest cart or wishlist -> sign in -> merge rules -> persisted authenticated state.
- Checkout flow: cart review -> checkout start -> reservation -> COD order placement -> order success.
- CMS flow: draft -> preview -> publish -> storefront reads published content only.
- Migration flow: component calls stay stable while the API source changes from MSW to the real backend by configuration.

## 8. Authentication And Authorization

- Chosen direction:
  - `httpOnly` session cookie
  - `Secure` over HTTPS
  - `SameSite=Lax` or stricter if supported by the final flow
  - FE route guards for UX only
  - backend enforcement for true authorization
- Open design item:
  - detailed Admin and CMS RBAC matrix beyond the current baseline
- Technical risk:
  - the mock-first cookie strategy still needs a spike to verify middleware and MSW behavior together

## 9. Loading, Empty, And Error States

- Explicitly required at minimum for:
  - PLP list loading, empty, and error
  - PDP variant-dependent add-to-cart behavior
  - search loading, empty, and error
  - cart optimistic update and rollback states
  - auth guard and unauthorized states
  - CMS preview and publish safety states
- `[Question]` Shared UX patterns for these states are referenced but not fully documented in dedicated files in this checkout.

## 10. Security

- Baseline controls already defined:
  - password policy
  - reset-token TTL and one-time use
  - auth rate limiting
  - CSRF strategy before soft launch
  - server-side permission checks
  - content sanitization
  - PII and secret exclusion from analytics and logs
  - audit trail for inventory, order status, and publish actions

## 11. Performance

- Storefront budget is strict because it is public and SEO-sensitive.
- Admin and CMS budgets are lighter because they are internal tools.
- Frontend design choices documented in support of performance:
  - self-hosted fonts
  - no runtime CSS-in-JS preference
  - shared token system
  - foundation-first design system

## 12. Observability

- Observability is still partially open.
- Known required elements:
  - runtime logging
  - request or trace correlation on critical flows
  - analytics event contract
  - audit trails
- `[Question]` Vendor choice, dashboard ownership, and production monitoring stack are not yet decided.

## 13. Migration

- Phase 1 migration is from docs-only design to implementation scaffold.
- Phase 2 migration is from mock API mode to real API mode without changing consumer components.
- Preconditions:
  - schema-first endpoint definitions
  - contract tests
  - environment flag strategy
  - removal of mock handlers from production builds

## 14. Testing Strategy

- Planned testing layers:
  - unit tests for URL-state parsing, SKU selection, locale fallback, business rules
  - frontend integration tests through MSW
  - E2E flows for storefront, Admin, and CMS critical paths
  - backend integration and security tests once backend exists
  - contract tests to prove mock and real APIs match
- Existing gaps called out by current docs:
  - no repo test files yet
  - no concrete performance test suite yet
  - security tests are still planned, not implemented

## 15. Alternatives And Trade-Offs

- Chosen: foundation-first over vertical slices first.
  - Benefit: stronger consistency and shared primitives.
  - Risk: over-scaffolding before revenue-critical flows are proven.
- Chosen: custom CMS over third-party headless CMS.
  - Benefit: full control.
  - Risk: larger implementation surface for a solo developer.
- Chosen: cookie-based auth over hosted provider or localStorage token storage.
  - Benefit: safer baseline and stable future backend contract.
  - Risk: higher implementation and mocking complexity now.
- Deferred: backend framework and infrastructure.
  - Benefit: avoids premature commitment.
  - Risk: some contract and delivery decisions remain provisional.
