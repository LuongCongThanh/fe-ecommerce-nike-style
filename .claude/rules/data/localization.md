---
paths:
  - 'src/**/*.{ts,tsx,json}'
description: Storefront next-intl, locale parity and translation key conventions.
---

# Localization conventions

- This storefront uses `next-intl`; do not introduce a second translation runtime.
- Storefront must have messages for both `vi` and `en`; Vietnamese is the default locale and fallback.
- Add the same key to every relevant locale/namespace in the same change; keep key structure consistent across locales.
- Keys describe meaning (`checkout.submitOrder`), not location or current wording (`greenButton`, `text1`).
- Do not concatenate a sentence from multiple fragments when word order can differ between languages; use the library's interpolation/pluralization instead.
- Format dates, numbers and currency with the correct locale; do not hand-concatenate a currency symbol or hard-code a date format in a component.
- Backend/CMS-provided content uses Localized Text per its contract; static UI labels use the message catalog.
