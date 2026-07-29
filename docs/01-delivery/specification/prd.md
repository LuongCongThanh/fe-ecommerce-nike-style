# Product Requirements Document

Generated from the current documentation set on July 29, 2026.

## 1. Problem Statement

- `PRD-F001` The project needs a real e-commerce platform for fashion and sneakers, not a demo or portfolio site.
- `PRD-F002` The team needs a way to design and validate the full customer commerce flow before a real backend exists.
- `PRD-F003` Internal operators need enough Admin and CMS capability to manage catalog, orders, and launch-blocking storefront content.

## 2. Business Objectives

- `PRD-F004` Launch an MVP that can complete COD orders end-to-end.
- `PRD-F005` Reduce future rework by using a foundation-first, contract-first, mock-first approach.
- `PRD-F006` Support Vietnamese and English on the storefront from day one.
- `PRD-F007` Keep Admin and CMS lean enough for a solo developer to build and operate.

## 3. Users And Roles

- `PRD-F008` Guest shopper browses, searches, adds to cart, and uses wishlist before authentication.
- `PRD-F009` Authenticated shopper manages account data, order history, and merged cart or wishlist state.
- `PRD-F010` Admin operator manages product, category, inventory basics, and order status.
- `PRD-F011` CMS content editor manages publishable storefront content.
- `PRD-F012` Product or founder role decides release scope, catalog truth, and open business decisions.

## 4. User Journeys

- `PRD-F013` Shopper journey: browse or search, open PDP, select variant, add to cart, complete COD checkout, view order success.
- `PRD-F014` Returning user journey: sign in, merge guest cart and wishlist, manage profile, address, and order history.
- `PRD-F015` Admin journey: authenticate, maintain product data, update order state, keep storefront operational.
- `PRD-F016` CMS journey: create or edit content, preview safely, publish only approved content to storefront.

## 5. Scope

- `PRD-F017` Storefront MVP includes category browse, PLP filtering and sorting, PDP variant selection, basic search, cart, wishlist, COD checkout, authentication, account core, and VN or EN support.
- `PRD-F018` Admin MVP includes product CRUD, category management, basic inventory management, order status management, Vietnamese-only UI, and baseline authorization.
- `PRD-F019` CMS MVP Phase 1 includes Hero Banner, Homepage Sections, Collection Landing Page, Promotion Banner, SEO Metadata, Blog, and Campaign, plus Vietnamese-only UI for editors and localized content entry for storefront output.
- `PRD-F020` Delivery scope includes security baseline, release slicing, success metrics, and test traceability.

## 6. Out Of Scope

- `PRD-F021` Online payment gateways are out of scope; MVP is COD-only.
- `PRD-F022` Third-party headless CMS is out of scope; CMS is custom-built.
- `PRD-F023` Final backend framework, database, and production infrastructure are not yet committed.
- `PRD-F024` Advanced RBAC beyond the current baseline is out of scope until later phases.
- `PRD-F025` Advanced recommendations, AI search, loyalty, gift cards, multi-currency, multi-warehouse, and microservices are out of scope.

## 7. Product Requirements

- `PRD-F026` Requirements must remain traceable back to `00-core/requirements/functional-requirements.md`.
- `PRD-F027` The mock-first frontend must be able to switch to real APIs without rewriting components.
- `PRD-F028` Storefront content and product data must support fallback to default locale `vi`.
- `PRD-F029` Internal tools must enforce authorization on sensitive actions, not just hide UI.
- `PRD-F030` Launch readiness must be judged by acceptance evidence, not by document completeness alone.

## 8. Dependencies

- `PRD-F031` Depends on a future monorepo scaffold with `apps/*` and `packages/*`, which is documented but not yet present in the repository.
- `PRD-F032` Depends on schema contracts, MSW mocking, and API envelope alignment between frontend and future backend.
- `PRD-F033` Depends on unresolved catalog truth, SKU seed data, analytics tooling, logging strategy, and detailed RBAC decisions.

## 9. Risks

- `PRD-F034` The repository currently contains documentation only, so architecture details referenced by many links are not yet backed by implementation artifacts.
- `PRD-F035` The architecture index points to detailed frontend and backend files that are not present in this checkout, which creates design-document drift risk.
- `PRD-F036` Authentication depends on a cookie-based flow that still needs a technical spike to prove the mock-first strategy works with middleware.
- `PRD-F037` Search, locale fallback coverage, and backend contract-test completeness have partial traceability today.
- `PRD-F038` Solo-developer throughput increases the risk of over-scaffolding before business-critical flows are proven.

## 10. Success Metrics

- `PRD-F039` North Star: completed COD orders per active week.
- `PRD-F040` Browse success: PLP or search to PDP progression.
- `PRD-F041` PDP success: add-to-cart rate and low variant-selection failure.
- `PRD-F042` Cart and checkout success: checkout-start and checkout-completion rates with acceptable failure or rollback rates.
- `PRD-F043` Auth and account success: sign-up completion, sign-in success, and usable account core.
- `PRD-F044` CMS and Admin success: draft-to-publish efficiency and operator task completion with low rework.

## 11. Questions And Assumptions

- `[Question]` Exact launch catalog, category tree, and initial SKU volume are not yet decided.
- `[Question]` Detailed Admin and CMS RBAC beyond the current baseline is not yet defined.
- `[Question]` Analytics vendor, observability stack, and release-governance owner are not yet assigned.
- `[Assumption]` The future codebase will follow the documented Turborepo shape under `E:\my-pj\FE`.
