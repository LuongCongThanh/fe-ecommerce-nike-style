---
paths:
  - 'apps/storefront/**'
description: Storefront-specific rules (Next.js App Router, locale, mock-first API, Serwist/MSW, Vitest/Playwright).
---

# Storefront conventions

- Keep the Next.js App Router and locale-segment conventions already used by neighboring routes.
- Customer-facing content must support both `vi` and `en`; Vietnamese is the default locale.
- Store shareable catalog filter, sort, pagination and navigation state in the URL.
- Keep the mock-first API flow through the server/browser adapters in `@repo/api-sdk`.
- Treat performance, accessibility, metadata and responsiveness as acceptance criteria for customer-facing UI.
- Serwist must not conflict with MSW in development; keep the existing environment-scoped guard.
- Add or update the nearest Vitest test for logic/components and a Playwright test for important browser flows.
