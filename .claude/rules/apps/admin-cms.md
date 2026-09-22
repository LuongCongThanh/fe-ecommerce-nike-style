---
paths:
  - 'apps/admin/**'
  - 'apps/cms/**'
description: App-specific rules for Admin and CMS (Vite + TanStack Router, react-i18next, Staff session/permissions).
---

# Admin and CMS conventions

- Both apps use Vite and TanStack Router; do not use Next.js APIs.
- Keep the `/admin` and `/cms` base paths and the contract with the Storefront microfrontend proxy unchanged.
- Use react-i18next for UI strings. Operational UI defaults to Vietnamese.
- Staff sessions in Admin follow the shared Better Auth-shaped adapter contract; do not let a feature depend directly on mock storage.
- Check Staff capability by permission, never by hard-coded role name.
- Keep CMS auth assumptions explicit; do not copy Admin's protection mechanism into CMS without an explicit requirement.
- Edit route sources and let the TanStack Router plugin regenerate `routeTree.gen.ts`.
