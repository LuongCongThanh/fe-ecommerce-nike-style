---
paths:
  - 'apps/storefront/src/**/*.{ts,tsx,json}'
  - 'apps/admin/src/**/*.{ts,tsx,json}'
  - 'apps/cms/src/**/*.{ts,tsx,json}'
  - 'packages/i18n/**'
description: The next-intl (Storefront) vs react-i18next (Admin/CMS) split and translation key conventions.
---

# Localization conventions

- Storefront uses `next-intl`; Admin and CMS use `react-i18next`. Do not mix the two libraries' APIs.
- Storefront must have messages for both `vi` and `en`; Vietnamese is the default locale and fallback.
- Admin/CMS use translation keys for UI chrome and default to Vietnamese; do not hard-code a new string in JSX once a screen already uses an i18n namespace.
- Add the same key to every relevant locale/namespace in the same change; keep key structure consistent across locales.
- Keys describe meaning (`checkout.submitOrder`), not location or current wording (`greenButton`, `text1`).
- Do not concatenate a sentence from multiple fragments when word order can differ between languages; use the library's interpolation/pluralization instead.
- Format dates, numbers and currency with the correct locale; do not hand-concatenate a currency symbol or hard-code a date format in a component.
- Backend/CMS-provided content uses Localized Text per its contract; static UI labels use the message catalog.
