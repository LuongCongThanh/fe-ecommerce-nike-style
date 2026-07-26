# i18n & Locale Architecture

Tài liệu này hình thức hoá kết quả phiên Grilling (brainstorm-session.md §9) thành kiến trúc cụ thể. Định nghĩa domain đầy đủ ở [`CONTEXT.md`](../../../CONTEXT.md); các quyết định gây tranh cãi ở `docs/adr/0001`–`0003`. Tài liệu này **không lặp lại** nội dung đó mà chỉ trả lời: *đặt ở đâu trong code, ai dùng, dùng thế nào*.

## Domain model (nhắc lại ngắn gọn — xem CONTEXT.md để đọc đầy đủ)

- **Locale** — ngôn ngữ hiển thị. Danh sách đóng, một nguồn sự thật trong code (ADR 0001).
- **Locale mặc định** — `vi`. Bắt buộc có giá trị cho mọi Localized Text.
- **Localized Text** — trường nội dung có giá trị khác nhau theo Locale, fallback về Locale mặc định khi thiếu, không chặn publish (Decision #16).
- **Market** — chưa dùng, đặt tên trước (Decision #14).

## Vị trí `SUPPORTED_LOCALES` [Đề xuất]

ADR 0001 yêu cầu "một package/config trung tâm" nhưng chưa chỉ định package nào. Đề xuất: đặt trong `packages/utils/src/i18n/locales.ts`, **không** tạo package `i18n` riêng (nhất quán nguyên tắc YAGNI — chưa có nhu cầu cho một package chỉ chứa vài hằng số).

```ts
// packages/utils/src/i18n/locales.ts
export const SUPPORTED_LOCALES = ['vi', 'en'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'vi';
```

Mọi nơi cần danh sách locale (routing middleware của `storefront`, cấu hình `next-intl`, form Content Editor nhập Localized Text trong `cms`) import từ đây — không định nghĩa mảng locale riêng ở bất kỳ nơi nào khác. Đây chính là cách tránh lặp lại lỗi 3-chỗ-không-đồng-bộ đã thấy ở `ecommerce-next/middleware.ts` (ADR 0001).

## Phạm vi áp dụng theo app [Đã chốt — Decision #17, ADR 0002]

| App | Đa Locale UI? | Dùng `SUPPORTED_LOCALES`? |
|---|---|---|
| `storefront` | Có (`vi`, `en`) | Có — routing + `next-intl` |
| `admin` | Không, chỉ `vi` | Không import cho routing (không có `[locale]` segment) |
| `cms` | Không cho UI chrome, **nhưng** Content Editor vẫn nhập Localized Text đa locale cho Product/CMS content | Có — chỉ để render form nhập liệu theo từng locale, không dùng cho routing |

## Localized Text — shape schema [Đề xuất]

Vì `packages/schemas` đã tồn tại (Decision #13, nguyên tắc Contract-first), đây là chỗ tự nhiên để định nghĩa shape dùng chung cho mọi field Localized Text (tên sản phẩm, mô tả, nội dung CMS...):

```ts
// packages/schemas/src/common/localized-text.ts
import { z } from 'zod';
import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from '@repo/utils/i18n/locales';

// Shape build động từ SUPPORTED_LOCALES — không hard-code literal locale key
// ('vi', 'en', ...) ở đây, tránh tái tạo lỗi 3-chỗ-không-đồng-bộ mà ADR 0001
// đã chỉ ra. Thêm locale mới chỉ cần sửa SUPPORTED_LOCALES, không sửa schema này.
const localeShape = Object.fromEntries(
  SUPPORTED_LOCALES.map((locale) => [
    locale,
    locale === DEFAULT_LOCALE
      ? z.string().min(1)      // Locale mặc định — bắt buộc (Decision #16)
      : z.string().optional(), // Locale khác — optional, fallback về mặc định khi thiếu
  ]),
) as Record<(typeof SUPPORTED_LOCALES)[number], z.ZodTypeAny>;

export const localizedTextSchema = z.object(localeShape);

export type LocalizedText = z.infer<typeof localizedTextSchema>;
```

Fallback logic (khi thiếu bản dịch `en` → hiển thị `vi`, không hiển thị trống, không chặn publish — Decision #16) là một hàm thuần trong `packages/utils`, dùng chung bởi cả `storefront` (render) và `cms` (preview).

## Typography — không override theo Locale [Đã chốt — ADR 0003]

Một bộ typography token duy nhất, line-height tính dư cho dấu tiếng Việt, dùng cho cả `vi`/`en`. Ràng buộc đi kèm: font hệ thống phải kiểm tra đủ glyph tiếng Việt **trước khi** đưa vào `packages/design-tokens` — đây là một acceptance criteria khi chọn font, không phải việc có thể làm sau.

## SEO đa locale

Xem [`performance-seo.md`](./performance-seo.md) — mục hreflang/alternates chỉ áp dụng cho `storefront` (nhất quán với ADR 0002, vì `admin`/`cms` không phải nội dung public).
