---
paths:
  - 'src/**'
description: Storefront-specific rules (Next.js App Router, locale, mock-first API, Serwist/MSW, Vitest/Playwright).
---

# Storefront conventions

- Keep the Next.js App Router and locale-segment conventions already used by neighboring routes.
- Customer-facing content must support both `vi` and `en`; Vietnamese is the default locale.
- Store shareable catalog filter, sort, pagination and navigation state in the URL.
- Catalog uses the real API; keep MSW through `src/lib/api` for flows awaiting their API cutover. Remove mocks only per the accepted contract migration.
- Treat performance, accessibility, metadata and responsiveness as acceptance criteria for customer-facing UI.
- Serwist must not conflict with MSW in development; keep the existing environment-scoped guard.
- Add or update the nearest Vitest test for logic/components and a Playwright test for important browser flows.
