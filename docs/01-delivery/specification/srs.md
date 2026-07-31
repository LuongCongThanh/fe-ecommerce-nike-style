# Software Requirements Specification

Derived from the current documentation set on July 29, 2026.

## 1. Functional Requirements

- `FR-001` The storefront shall let users browse products by Category and filter by Gender.
- `FR-002` The storefront shall provide PLP filtering, sorting, pagination, and URL-as-state behavior.
- `FR-003` The storefront shall resolve variant selection to exactly one SKU and show SKU-specific price and stock.
- `FR-004` The storefront shall provide basic product search.
- `FR-005` The storefront shall support guest and authenticated cart operations, including merge after sign-in.
- `FR-006` The storefront shall support guest and authenticated wishlist operations, including merge after sign-in.
- `FR-007` The storefront shall provide COD-only checkout and order success flow.
- `FR-008` The storefront shall support sign up, sign in, forgot password, and reset password.
- `FR-009` The storefront shall provide account core features: profile, addresses, and order history.
- `FR-010` The storefront shall support Vietnamese and English UI and localized product or CMS content with fallback to default locale `vi`.
- `FR-011` Admin shall support product CRUD.
- `FR-012` Admin shall support category management.
- `FR-013` Admin shall support basic inventory management.
- `FR-014` Admin shall support order status management.
- `FR-015` Admin UI shall be Vietnamese-only.
- `FR-016` Admin shall enforce baseline authorization.
- `FR-017` CMS shall support Hero Banner, Homepage Sections, Collection Landing Page, Promotion Banner, SEO Metadata, Blog, and Campaign content types.
- `FR-018` CMS UI shall be Vietnamese-only while still allowing localized storefront content entry.
- `FR-019` CMS shall support draft, preview, and publish workflows for publishable content.
- `FR-020` The frontend shall be able to switch from mock to real API mode without component rewrites.

## 2. Non-Functional Requirements

- `NFR-001` Storefront performance target shall be LCP under 2.5 seconds, CLS under 0.1, INP under 200 milliseconds, and Lighthouse above 95.
- `NFR-002` Admin and CMS shall target LCP under 4 seconds and INP under 500 milliseconds.
- `NFR-003` Security baseline shall be applied during mock-first development, not deferred until production integration.
- `NFR-004` The design shall favor maintainability and traceability over time-based delivery targets.
- `NFR-005` The system design shall support contract-first development through shared schemas and a stable error envelope.

## 3. Business Rules

- `BR-001` Storefront checkout shall support COD only.
- `BR-002` Locale and Market are separate concepts; current scope uses Locale only.
- `BR-003` Supported locales shall come from a closed list managed in code.
- `BR-004` Storefront shall support UI and content localization; Admin and CMS UI shall not.
- `BR-005` Typography tokens shall be shared across locales and must accommodate Vietnamese glyphs safely.
- `BR-006` Cart items shall reference SKU directly.
- `BR-007` Guest and authenticated cart merge shall add quantities and clamp to available stock.
- `BR-008` Reservation shall begin at checkout start, not at add-to-cart time.
- `BR-009` Order state shall follow the COD-only lifecycle documented in the glossary and decision log.
- `BR-010` Order items shall snapshot purchase-time data.
- `BR-011` Wishlist items shall reference Product, not SKU.
- `BR-012` Wishlist merge shall union by Product without duplicates.
- `BR-013` Move-to-cart from wishlist shall require PDP variant choice when the product has variants.
- `BR-014` Return requests shall be allowed only within seven days of delivery.
- `BR-015` Return approval shall require manual operator review.
- `BR-016` COD refund tracking shall be recorded in-system, but money transfer remains manual.

## 4. Validation Rules

- `VR-001` Variant selection is invalid until enough attributes are selected to identify one SKU.
- `VR-002` Add-to-cart shall fail or rollback when stock is unavailable or price changes.
- `VR-003` Localized Text shall require a value in default locale `vi`; other locales may fallback.
- `VR-004` Password minimum length shall be 10 characters.
- `VR-005` Common deny-list passwords shall be rejected.
- `VR-006` Password reset tokens shall be single-use and expire after 15 minutes.
- `VR-007` Auth endpoints shall apply baseline throttling after five failed attempts per 15 minutes per IP plus identifier.
- `VR-008` Order state transitions shall reject invalid status jumps.
- `VR-009` CMS preview content shall not become publicly visible before publish.
- `VR-010` Public storefront rendering of CMS rich content shall sanitize unsafe payloads.

## 5. Permissions

- `PERM-001` Storefront public browsing shall be accessible without authentication.
- `PERM-002` Account routes shall require authenticated customer access.
- `PERM-003` Admin and CMS route guards shall be enforced server-side, not only in FE route guards.
- `PERM-004` Admin product and order actions shall require baseline Admin capability.
- `PERM-005` CMS draft, preview, and publish actions shall require baseline CMS capability.
- `PERM-006` Detailed role matrix beyond the current RBAC baseline remains a question and shall not be invented.

## 6. Acceptance Criteria

- `AC-001` A user can browse by Category and Gender and retain filter state in the URL.
- `AC-002` A user can select a valid variant and add the correct SKU to cart.
- `AC-003` Search returns stable results and supports empty and error states without breaking browse flow.
- `AC-004` Cart add, update, delete, and post-login merge behave according to merge rules.
- `AC-005` Wishlist guest-to-user merge preserves intended products without duplication.
- `AC-006` A shopper can complete the COD flow through order success.
- `AC-007` Authentication and account core flows work with protected route behavior.
- `AC-008` Storefront VN and EN flows render with fallback to `vi` when translations are missing.
- `AC-009` Admin operators can manage products and order status within the current authorization baseline.
- `AC-010` CMS editors can create draft content, preview it safely, and publish storefront-visible content.
- `AC-011` Sensitive flows meet the documented security baseline.
- `AC-012` Swapping mock and real APIs requires configuration change, not component rewrites.

## 7. Error Scenarios

- `ERR-001` Malformed URL query parameters for PLP state.
- `ERR-002` Incomplete or conflicting variant selection.
- `ERR-003` Search returns no matches.
- `ERR-004` Cart rollback due to stock or price change.
- `ERR-005` Unauthorized access to account, Admin, or CMS routes.
- `ERR-006` Expired, reused, or invalid password reset token.
- `ERR-007` Rate-limited authentication requests.
- `ERR-008` Invalid order state transition from Admin tools.
- `ERR-009` Missing non-default translation while storefront must still render.
- `ERR-010` CMS draft content accidentally exposed publicly.

## 8. Edge Cases

- `EDGE-001` Product with no variants maps to one hidden SKU.
- `EDGE-002` Product with one-value axis still counts as variant-bearing.
- `EDGE-003` Unisex products appear through Gender filtering without category duplication.
- `EDGE-004` Guest cart and authenticated cart contain the same SKU with combined quantity above availability.
- `EDGE-005` Wishlist move-to-cart differs for products with and without variants.
- `EDGE-006` User switches locale during the same session without layout instability.
- `EDGE-007` Search debounce or stale response ordering.
- `EDGE-008` Checkout retry must not duplicate order creation.

## 9. Questions And Assumptions

- `[Question]` Analytics event schema, observability tooling, and release-governance ownership remain open.
- `[Question]` Detailed RBAC roles and permissions for Admin and CMS remain open.
- `[Question]` Final backend infrastructure remains open; runtime/framework, PostgreSQL, and Prisma are fixed by Decision #60–62.
- `[Assumption]` Requirements not explicitly present in the source docs are intentionally left unspecified here.
