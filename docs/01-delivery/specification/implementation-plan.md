# Implementation Plan

Generated on July 29, 2026.

This plan assumes the future implementation will be added under `E:\my-pj\FE` and that the documented monorepo structure will be created first. No application code exists yet in this checkout.

## Task TSK-001

- Requirement IDs: `PRD-F026`, `PRD-F031`, `FR-020`, `NFR-005`
- Objective: Create the monorepo scaffold and shared configuration boundary that the docs already assume.
- Dependencies: none
- Files to create:
  - `apps/storefront/`
  - `apps/admin/`
  - `apps/cms/`
  - `packages/design-tokens/`
  - `packages/ui/`
  - `packages/commerce/`
  - `packages/schemas/`
  - `packages/api-sdk/`
  - `packages/hooks/`
  - `packages/utils/`
  - root workspace files such as `turbo.json`, workspace package manifest, shared TypeScript and lint config
- Files to modify:
  - `docs/01-delivery/specification/technical-design.md`
- Detailed changes:
  - scaffold the documented repo shape
  - encode package boundaries and import rules from the decision log
  - document any deviations immediately
- Unit tests: config and utility smoke checks for workspace resolution
- Integration tests: package import and build smoke validation
- E2E tests: none
- Validation commands:
  - workspace install
  - workspace lint
  - workspace typecheck
- Expected result: repo shape matches the documented architecture and can build locally
- Risk: over-scaffolding before critical business flows
- Definition of Done: scaffold exists, shared config works, and no undocumented structure drift remains

## Task TSK-002

- Requirement IDs: `PRD-F027`, `FR-020`, `NFR-005`
- Objective: Establish schema-first contracts, error envelope rules, and mock-first API plumbing.
- Dependencies: `TSK-001`
- Files to create:
  - `packages/schemas/src/**`
  - `packages/api-sdk/src/**`
  - `packages/api-sdk/src/mocks/**`
  - shared API environment config
- Files to modify:
  - `docs/01-delivery/specification/technical-design.md`
  - `docs/01-delivery/specification/srs.md`
- Detailed changes:
  - define schemas for catalog, cart, wishlist, auth, account, checkout, Admin, and CMS capabilities
  - define shared error envelope and pagination or filter rules
  - connect MSW handlers to the same schema contracts
- Unit tests: schema validation helpers and envelope serialization
- Integration tests: FE mock contract tests for product list and detail, auth, cart, and CMS preview or publish
- E2E tests: none
- Validation commands:
  - package tests for schemas and api-sdk
  - mock contract validation suite
- Expected result: FE-facing API contract is stable and mock mode uses the same shapes as future real APIs
- Risk: incomplete endpoint inventory because current docs reference files missing from this checkout
- Definition of Done: contracts exist for launch-blocking flows and pass validation tests

## Task TSK-003

- Requirement IDs: `PRD-F006`, `PRD-F028`, `FR-010`, `BR-002`, `BR-003`, `BR-004`, `BR-005`, `VR-003`
- Objective: Implement locale and localized-content foundations.
- Dependencies: `TSK-001`, `TSK-002`
- Files to create:
  - `packages/design-tokens/src/**`
  - `packages/utils/src/i18n/**`
  - storefront locale routing files
  - localized text helpers
- Files to modify:
  - `docs/00-core/glossary.md`
  - `docs/01-delivery/specification/technical-design.md`
- Detailed changes:
  - encode closed locale list
  - implement default-locale fallback behavior
  - ensure typography tokens support both `vi` and `en`
  - keep Admin and CMS UI single-locale
- Unit tests: locale fallback, supported-locale guard, typography token safety helpers if applicable
- Integration tests: storefront localized content rendering and missing-translation fallback
- E2E tests: locale switch and storefront fallback behavior
- Validation commands:
  - targeted unit tests
  - storefront integration suite
  - locale E2E flow
- Expected result: locale behavior matches ADR and glossary rules
- Risk: some detailed i18n design docs referenced today do not exist in the checkout
- Definition of Done: storefront locale contract works and Admin or CMS remain Vietnamese-only

## Task TSK-004

- Requirement IDs: `PRD-F017`, `FR-001`, `FR-002`, `FR-003`, `FR-004`, `AC-001`, `AC-002`, `AC-003`
- Objective: Build storefront browse, PLP, PDP, and basic search foundations.
- Dependencies: `TSK-002`, `TSK-003`
- Files to create:
  - `apps/storefront/src/features/catalog/**`
  - `apps/storefront/src/features/search/**`
  - supporting shared UI or commerce components
- Files to modify:
  - `packages/api-sdk/src/**`
  - `packages/schemas/src/**`
- Detailed changes:
  - implement category and gender browse
  - implement URL-driven PLP state
  - implement PDP variant-to-SKU resolution
  - implement basic search with empty and error handling
- Unit tests: URL state parsing and SKU selection logic
- Integration tests: PLP, PDP, and search scenarios through MSW
- E2E tests: public browse and search flows
- Validation commands:
  - storefront unit and integration tests
  - Playwright browse path
- Expected result: storefront discovery flow works end-to-end in mock mode
- Risk: real catalog truth is still open
- Definition of Done: browse and PDP behavior satisfy launch-blocking requirements under mock data

## Task TSK-005

- Requirement IDs: `PRD-F017`, `FR-005`, `FR-006`, `BR-006` through `BR-013`, `AC-004`, `AC-005`
- Objective: Implement cart and wishlist behavior including guest-to-user merge rules.
- Dependencies: `TSK-002`, `TSK-004`
- Files to create:
  - `apps/storefront/src/features/cart/**`
  - `apps/storefront/src/features/wishlist/**`
  - shared hooks for cart and wishlist state
- Files to modify:
  - `packages/api-sdk/src/**`
  - `packages/schemas/src/**`
- Detailed changes:
  - implement SKU-based cart actions
  - implement optimistic updates and rollback
  - implement product-based wishlist behavior
  - implement merge rules after authentication
- Unit tests: merge rules and move-to-cart edge cases
- Integration tests: cart rollback and wishlist merge
- E2E tests: guest-to-authenticated merge flows
- Validation commands:
  - targeted unit suite
  - storefront cart or wishlist integration suite
  - Playwright merge scenarios
- Expected result: cart and wishlist behave according to glossary rules
- Risk: merge logic spans auth and storefront state boundaries
- Definition of Done: no documented cart or wishlist business rule remains untested

## Task TSK-006

- Requirement IDs: `PRD-F017`, `FR-008`, `FR-009`, `PERM-001`, `PERM-002`, `AC-006`, `AC-007`
- Objective: Implement storefront authentication and account core with protected-route behavior.
- Dependencies: `TSK-002`, `TSK-003`
- Files to create:
  - `apps/storefront/src/features/auth/**`
  - `apps/storefront/src/features/account/**`
  - middleware or route-guard integration
- Files to modify:
  - `packages/api-sdk/src/**`
  - `packages/schemas/src/**`
  - auth environment configuration
- Detailed changes:
  - implement sign up, sign in, forgot password, reset password
  - implement account profile, address, and order history views
  - implement cookie-based session integration
  - run the documented auth spike if not already proven
- Unit tests: auth helpers and guard utilities
- Integration tests: auth form flows and account data loading
- E2E tests: sign in, sign up, and protected-route access
- Validation commands:
  - auth unit and integration suite
  - Playwright auth or account suite
- Expected result: authenticated customer journey works without violating the security baseline
- Risk: mock cookie and middleware strategy may fail and force a technical adjustment
- Definition of Done: auth flows pass tests and the chosen cookie strategy is technically proven

## Task TSK-007

- Requirement IDs: `PRD-F004`, `PRD-F017`, `FR-007`, `BR-008` through `BR-010`, `AC-006`, `EDGE-008`
- Objective: Implement COD checkout and order success flow in mock mode.
- Dependencies: `TSK-004`, `TSK-005`, `TSK-006`
- Files to create:
  - `apps/storefront/src/features/checkout/**`
  - `apps/storefront/src/features/orders/**`
- Files to modify:
  - `packages/api-sdk/src/**`
  - `packages/schemas/src/**`
- Detailed changes:
  - implement checkout steps and order submission
  - reflect reservation and order-state rules in contracts and UI
  - support idempotent place-order behavior in the API abstraction
- Unit tests: order state and idempotency helpers where FE-owned
- Integration tests: checkout success, validation failure, and retry handling
- E2E tests: end-to-end COD order path
- Validation commands:
  - checkout integration suite
  - Playwright critical purchase path
- Expected result: storefront can complete a COD order in mock mode
- Risk: backend idempotency proof will still be deferred until real API integration
- Definition of Done: launch-blocking checkout flow is demonstrably stable in FE mock mode

## Task TSK-008

- Requirement IDs: `PRD-F018`, `FR-011`, `FR-012`, `FR-013`, `FR-014`, `FR-015`, `FR-016`, `PERM-003`, `PERM-004`, `AC-009`
- Objective: Build Admin MVP capabilities and baseline authorization behavior.
- Dependencies: `TSK-001`, `TSK-002`
- Files to create:
  - `apps/admin/src/features/catalog/**`
  - `apps/admin/src/features/orders/**`
  - `apps/admin/src/features/inventory/**`
- Files to modify:
  - `packages/api-sdk/src/**`
  - `packages/schemas/src/**`
- Detailed changes:
  - implement product CRUD
  - implement category management
  - implement basic inventory updates
  - implement order status management
  - keep the UI Vietnamese-only
- Unit tests: transition guards and inventory form validation helpers
- Integration tests: Admin CRUD and order-state updates
- E2E tests: authorized and unauthorized Admin access scenarios
- Validation commands:
  - Admin integration suite
  - Admin Playwright suite
- Expected result: internal operators can manage launch-blocking Admin flows within baseline permissions
- Risk: detailed RBAC is still open, so only baseline enforcement should be assumed
- Definition of Done: Admin MVP meets the current baseline and does not over-commit to unapproved role detail

## Task TSK-009

- Requirement IDs: `PRD-F019`, `FR-017`, `FR-018`, `FR-019`, `PERM-005`, `AC-010`
- Objective: Build CMS Phase 1 content workflows and publish safety.
- Dependencies: `TSK-001`, `TSK-002`, `TSK-003`
- Files to create:
  - `apps/cms/src/features/content/**`
  - `apps/cms/src/features/preview/**`
  - `apps/cms/src/features/publish/**`
- Files to modify:
  - `packages/api-sdk/src/**`
  - `packages/schemas/src/**`
- Detailed changes:
  - implement the seven content types in current scope
  - implement draft, preview, and publish behavior
  - support localized content-entry fields while keeping CMS UI Vietnamese-only
- Unit tests: content validation helpers and locale-content fallback helpers if FE-owned
- Integration tests: draft save, preview visibility, publish behavior
- E2E tests: content editor publish flow and unauthorized publish rejection
- Validation commands:
  - CMS integration suite
  - CMS Playwright suite
- Expected result: storefront content can be operated through a safe internal workflow
- Risk: exact content schema detail is partially reference-driven today
- Definition of Done: CMS can support launch-blocking storefront content without leaking drafts publicly

## Task TSK-010

- Requirement IDs: `PRD-F029`, `FR-016`, `NFR-003`, `VR-004` through `VR-010`, `PERM-003`, `AC-011`
- Objective: Implement the documented security baseline across FE and the future backend contract layer.
- Dependencies: `TSK-006`, `TSK-008`, `TSK-009`
- Files to create:
  - security test suites
  - analytics payload validation helpers
  - audit trail contract definitions
- Files to modify:
  - auth flows
  - CMS rendering paths
  - Admin mutation paths
- Detailed changes:
  - enforce password, token, throttling, and session rules
  - define CSRF-ready mutation patterns
  - sanitize public CMS content
  - prevent PII from entering analytics or logs
  - capture audit-trail metadata
- Unit tests: analytics payload deny-list and content sanitization helpers
- Integration tests: security-sensitive form and mutation flows
- E2E tests: permission and publish-security flows where feasible
- Validation commands:
  - security test suite
  - targeted regression suite
- Expected result: security claims are backed by explicit tests and runtime safeguards
- Risk: backend enforcement work cannot be fully proven until backend exists
- Definition of Done: all baseline security checklist items have concrete evidence or clearly documented backend follow-up

## Task TSK-011

- Requirement IDs: `PRD-F032`, `PRD-F033`, `PRD-F040` through `PRD-F044`, `NFR-004`
- Objective: Add observability, success-metric instrumentation hooks, and release evidence capture.
- Dependencies: `TSK-004` through `TSK-010`
- Files to create:
  - analytics event schema definitions
  - logging and trace helpers
  - release evidence checklist docs
- Files to modify:
  - storefront, Admin, and CMS event emission points
  - `docs/01-delivery/product/success-metrics.md`
- Detailed changes:
  - instrument the event list already documented
  - add trace correlation for critical flows
  - record release evidence aligned to the acceptance matrix
- Unit tests: event-payload schema validation
- Integration tests: event emission on core actions
- E2E tests: smoke checks around critical instrumented paths
- Validation commands:
  - analytics schema tests
  - flow-specific instrumentation tests
- Expected result: success metrics are measurable and acceptance evidence can be gathered consistently
- Risk: analytics tool and dashboard ownership remain open
- Definition of Done: event contract exists, sensitive data is excluded, and critical flows emit measurable signals

## Task TSK-012

- Requirement IDs: `PRD-F027`, `PRD-F030`, `FR-020`, `AC-012`
- Objective: Integrate the real backend behind the existing contracts and retire production mock usage.
- Dependencies: `TSK-002`, plus the backend roadmap phases needed for launch flows
- Files to create:
  - backend contract-test suites
  - environment-specific integration configs
- Files to modify:
  - `packages/api-sdk/src/**`
  - runtime environment config
  - deployment or startup documentation
- Detailed changes:
  - switch launch-blocking flows from MSW to real APIs in a controlled sequence
  - prove schema parity
  - disable production mock handlers
- Unit tests: adapter-level tests if required
- Integration tests: backend contract parity for product, auth, cart, checkout, Admin, and CMS endpoints
- E2E tests: launch-blocking regression in real API mode
- Validation commands:
  - backend integration suite
  - contract parity suite
  - end-to-end regression in real API mode
- Expected result: FE works against real APIs by changing configuration, not components
- Risk: unresolved backend technology and incomplete contract coverage can delay this phase
- Definition of Done: launch-blocking flows pass in real API mode and production builds no longer depend on MSW
