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

- Target FE architecture is a Turborepo monorepo with:
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
- `[Assumption]` The FE implementation will follow the documented Turborepo structure; the NestJS modular monolith will live in a separate repository and integrate through a versioned API contract (Decision #63).
- `[Decision]` Local Backend runs NestJS on the host; Docker Compose provides pinned PostgreSQL and Mailpit services. Integration tests use an isolated database container; Redis/BullMQ remain deferred because V1 background work uses the PostgreSQL outbox/job queue (Decisions #68, #77).
- `[Decision]` Backend tests use Jest, Supertest, and Testcontainers PostgreSQL; database integration is never proven with mocks. FE Playwright owns cross-repository user journeys (Decision #69).

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
- The Backend technology foundation is confirmed in Decisions #60–#75; remaining infrastructure vendors and selected module policies are still open.
- Confirmed backend-level constraints:
  - auth uses an in-memory JWT access token plus rotating opaque refresh token in a first-party `HttpOnly` cookie (Decision #65)
  - API responses should follow a shared envelope
  - server should enforce permissions, CSRF strategy, rate limits, audit trails, and sanitize public content

## 5. API Contracts

- `packages/schemas` is the transitional baseline for the API v1 handshake.
- After that handshake, the Backend publishes the canonical versioned OpenAPI artifact; FE pins a version and generates its TypeScript client and Zod adapters.
- Backend transport types use Nest DTO classes, `class-validator`/`class-transformer`, global `ValidationPipe`, and `@nestjs/swagger`; no manually duplicated Zod transport schemas live in the Backend (Decision #71, ADR 0012).
- Business endpoints use NestJS URI versioning at `/api/v1`; `/health/live` and `/health/ready` are version-neutral. OpenAPI artifact SemVer is independent from the URI major version (Decision #73).
- NestJS uses the default Express adapter for the initial Backend. Native Express request/response types remain at the HTTP edge and do not leak into application or domain services (Decision #74).
- Catalog search uses PostgreSQL Full-Text Search, `unaccent`, and `pg_trgm`; Prisma remains the default data access while extension/index migrations and specialized search queries may use parameterized raw SQL (Decision #75).
- Product and CMS media use an S3-compatible `ObjectStorage` port. V1 streams Backend-mediated multipart uploads to storage while PostgreSQL persists only `Asset` metadata; public CDN delivery is gated by publish state (Decision #76).
- Background effects use a PostgreSQL transactional outbox/durable job table with `SKIP LOCKED` claims, at-least-once delivery, idempotent handlers, retry/backoff, and dead-letter state. The V1 worker runs in-process behind a separable boundary (Decision #77).
- Contract properties already documented:
  - stable request and response shapes
  - stable error envelope
  - support for filter, sort, pagination
  - auth and authorization responses aligned with FE expectations
  - real API and mock API must preserve the same contract
  - breaking changes require a new contract version and CI compatibility evidence
  - unknown/non-whitelisted request fields are rejected and validation errors preserve the stable error envelope
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
  - short-lived JWT access token held in browser memory and sent as a Bearer token
  - rotating opaque refresh token in an `HttpOnly`, `Secure`, `SameSite` cookie
  - hashed refresh-token family state in PostgreSQL for revocation and reuse detection
  - no auth tokens in `localStorage` or `sessionStorage`
  - `storefront` TTL: 10-minute access, 7-day refresh idle, 30-day absolute family lifetime
  - `admin`/`cms` TTL: 5-minute access, 8-hour refresh idle, 24-hour absolute family lifetime
  - each FE app has an independent registrable domain and calls same-origin `/api/*`; hosting proxies to the separate Backend deployment
  - refresh cookies remain first-party and host-only per app; no direct cross-site credentialed refresh flow
  - FE route guards for UX only
  - backend enforcement for true authorization
- Open design item:
  - detailed Admin and CMS RBAC matrix beyond the current baseline
- Technical risk:
  - refresh/retry concurrency, token-family reuse detection, and protected-route bootstrapping need a focused spike before auth feature implementation

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
  - password policy and Argon2id hashing (`m=19456 KiB`, `t=2`, `p=1` minimum), production benchmark, and rehash-on-login
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

- Pino/`nestjs-pino` structured JSON logs in production and pretty output in development.
- Request/correlation ID propagates through proxy, Backend, response headers, and logs.
- Credentials, tokens, cookies, and unnecessary PII are redacted.
- Inventory, order status, Admin, and CMS publish actions write a separate PostgreSQL audit trail.
- Liveness and readiness health endpoints are required.
- Analytics event contracts remain separate from operational logs and audit records.
- `[Question]` Monitoring/tracing vendor, dashboard ownership, and alert routing must be chosen before staging; Phase 0 remains vendor-neutral (Decision #70).

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
- Chosen: short-lived JWT access token plus rotating opaque refresh token over a server-side session or browser-stored long-lived JWT (Decision #65, ADR 0010).
  - Benefit: JWT-based API authorization while retaining refresh revocation and reuse detection.
  - Risk: higher refresh, retry, and browser bootstrapping complexity than an opaque session.
- Chosen: Node.js LTS + TypeScript strict + NestJS modular monolith for the backend (Decision #60, ADR 0005).
  - Benefit: one TypeScript ecosystem, explicit module boundaries, and a conventional path for a first-time Backend developer.
  - Risk: Backend fundamentals such as transactions, concurrency, and security still require deliberate learning and testing.
- Chosen: PostgreSQL as the Backend primary database (Decision #61, ADR 0006).
  - Benefit: relational constraints and transaction semantics fit the commerce domain and inventory concurrency requirements.
  - Risk: critical transactions still require explicit isolation, locking, retry, and integration tests.
- Chosen: Prisma as the default data-access layer, with controlled raw SQL for exceptional transaction, locking, or query needs (Decision #62, ADR 0007).
  - Benefit: type-safe queries, migrations, and accessible tooling without giving up PostgreSQL-specific control on critical paths.
  - Risk: developers must avoid assuming Prisma removes the need to understand SQL and transaction semantics.
- Deferred: backend infrastructure.
  - Benefit: infrastructure can be evaluated against the confirmed application and persistence stack.
  - Risk: some persistence and delivery decisions remain provisional.
