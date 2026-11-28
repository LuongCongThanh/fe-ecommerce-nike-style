# Nghiên cứu quy ước đặt tên cho Storefront

Ngày đối chiếu: 24/11/2026. Phạm vi: tên file, folder, symbol và import; chưa đổi source hoặc rule owner.
Đây là ghi chú nghiên cứu và khuyến nghị, không tự ban hành convention mới.
Nguồn hiện hành: [rule map](../conventions/code-conventions.md), [TypeScript/React](../../.claude/rules/core/typescript-react.md), [imports](../../.claude/rules/core/imports-and-reuse.md).
Ghi chú bổ sung cho [nghiên cứu cấu trúc](nextjs-storefront-structure.md).

## Hướng đặt tên đã thống nhất khi thảo luận

Người dùng đã chọn nguyên tắc **dùng từ tiếng Anh quen thuộc, diễn đạt trách nhiệm cụ thể** cho cấu trúc đích. Quyết định này cập nhật hướng đề xuất bên dưới; chưa thay thế convention đang có hiệu lực trong source.

| Folder đích            | Trách nhiệm                                                    |
| ---------------------- | -------------------------------------------------------------- |
| `app`                  | Giữ các điểm vào Next.js; phần triển khai đặt bên ngoài        |
| `providers`            | Cấu hình và cung cấp context cho cây React, như query và theme |
| `layouts`              | Khung giao diện dùng chung, header, footer và navigation       |
| `modules`              | Màn hình, tương tác và logic thuộc từng nghiệp vụ cửa hàng     |
| `integrations/backend` | Kết nối Backend: transport, endpoint và hợp đồng API           |
| `shared/components`    | Component không gắn nghiệp vụ cụ thể, như Button và Dialog     |
| `testing`              | Setup và helper kiểm thử dùng chung; test vẫn đặt cạnh source  |

Không thêm folder `application`, `composition` hoặc `lib` trong cây đích chỉ để gom mã khó phân loại. Đây là lựa chọn về khả năng đọc hiểu của dự án, không phải yêu cầu từ Next.js hoặc SOLID. Giữ các tên đặc biệt Next.js theo framework.

### Tổ chức module và hậu tố đã chốt

Module có thể có `components`, `hooks`, `queries`, `schemas`, `stores`, `services`, `types` khi có nhu cầu. `services` chứa quy trình nghiệp vụ có trách nhiệm rõ, không thêm lớp chỉ chuyển tiếp SDK. `types` chứa contract nội bộ dùng chung; props hoặc type chỉ một file dùng vẫn đặt cạnh consumer. Hợp đồng Backend vẫn do phần tích hợp Backend sở hữu.

| Vai trò                     | Tên file đích               | Test cạnh source                              |
| --------------------------- | --------------------------- | --------------------------------------------- |
| Service                     | `placeOrder.service.ts`     | `placeOrder.service.test.ts`                  |
| Types/interfaces dùng chung | `orderSubmission.types.ts`  | Không tạo test chỉ để kiểm type               |
| Schema                      | `shippingAddress.schema.ts` | `shippingAddress.schema.test.ts`              |
| Store                       | `cartSelection.store.ts`    | `cartSelection.store.test.ts`                 |
| Component                   | `ShippingAddressForm.tsx`   | `ShippingAddressForm.test.tsx`                |
| Hook                        | `usePlaceOrder.ts`          | `usePlaceOrder.test.ts(x)`, theo nội dung JSX |

Công thức là `<responsibility>.<role>.ts` cho các vai trò đã chốt ở trên. Không thêm `.component` hoặc `.hook`; PascalCase và tiền tố `use` đã nhận diện vai trò. Service không bắt buộc là class. Không thêm tiền tố `I` cho interface. File đặc biệt Next.js và generated contract giữ quy tắc riêng. Chưa tự bổ sung suffix khác như `.port`, `.repository`, `.enum`.

Khi module có nhiều màn hình, chia theo màn hình/chức năng như `product-list`, `product-detail`, `shipping-address`; bên trong chỉ tạo folder kỹ thuật khi cần. Khi `services` hoặc `types` có nhiều trách nhiệm, nhóm theo chức năng thay vì tạo kho chứa chung của toàn app. Test đi cùng owner, E2E giữ ở root `e2e`.

```text
src/modules/checkout/
  CheckoutScreen.tsx
  services/
    order-submission/
      placeOrder.service.ts
      placeOrder.service.test.ts
    checkout-preparation/
      prepareCheckout.service.ts
  types/
    orderSubmission.types.ts
    checkout.types.ts
  shipping-address/
    ShippingAddressForm.tsx
    ShippingAddressForm.test.tsx
    schemas/
      shippingAddress.schema.ts
      shippingAddress.schema.test.ts
```

Cây là ví dụ vị trí, không yêu cầu tạo các folder rỗng hoặc tạo nhiều tầng theo số file cố định. Service của một chức năng riêng có thể nằm trong `services` của chức năng đó; service dùng chung nhiều chức năng trong checkout nằm ở `checkout/services`. Quy tắc nghiệp vụ phải có owner rõ, interface nhỏ khi cần dependency inversion; số folder và suffix không chứng minh SOLID.

### Vị trí schema đã chốt

- Schema kiểm tra input form thuộc module hoặc chức năng sở hữu form, ví dụ `modules/checkout/shipping-address/schemas/shippingAddress.schema.ts`.
- Schema kiểm tra request/response API thuộc `integrations/backend/schemas`, ví dụ `cartResponse.schema.ts`; có thể nhóm theo nghiệp vụ khi cần. Contract generated thuộc phần tích hợp Backend, không sửa thủ công.
- Type/interface phục vụ kiểm tra tĩnh; schema phục vụ kiểm tra giá trị lúc chạy. Không nhân đôi hai schema giống nhau chỉ để đủ lớp; phân biệt khi cấu trúc, trách nhiệm hoặc vòng đời thay đổi khác nhau. Backend vẫn tự enforce validation và authorization.

### Ranh giới module đã chốt

Module chỉ công khai component, hàm hoặc type có consumer hợp lệ và owner rõ; module khác không truy cập file private tùy ý. Public entry là module cụ thể được tài liệu/lint cho phép, không tạo barrel `index.ts` mới. Việc export một symbol không tự biến nó thành public API của module.

Ví dụ catalog có thể cung cấp `FeaturedProducts` cho trang chủ, nhưng không mặc định cho phép home import query/service nội bộ catalog. Phối hợp nhiều module ưu tiên tại route mỏng hoặc layout bên ngoài module; phần triển khai giao diện vẫn nằm ngoài `app`. Nếu một màn hình trong module cần dùng public API của module khác, dependency phải được ghi nhận rõ và không tạo vòng phụ thuộc. Chỉ đưa logic lên scope chung khi semantics, consumer và owner đã rõ; không biến `shared` thành nơi chứa mọi logic nghiệp vụ dùng lại.

Đích này là feature modular với public boundary có kiểm soát, không tuyên bố tuân toàn bộ import rule của FSD. Khi triển khai phải đối chiếu và cập nhật lint cho từng dependency được phép, không mở toàn bộ cross-module import.

Cách chuyển từ source hiện tại còn cần lập kế hoạch sau khi duyệt toàn bộ thiết kế. Khi triển khai phải cập nhật rule owner, tài liệu kiến trúc và cấu hình import tương ứng; không chỉ đổi tên folder. Các bảng khảo sát phía dưới phản ánh convention trước quyết định này, không phủ định suffix đích vừa chốt. Glossary nghiệp vụ không dùng để ghi các convention kỹ thuật này.

## Kết luận

Repo **đã có quy ước rõ**, nhưng không có một chuẩn ngành bắt buộc mọi file Next.js/React/TypeScript dùng cùng casing.
Giữ component `PascalCase.tsx`, hook `useCamelCase.ts`, utility `camelCase.ts`, store `<domain>.store.ts`, folder thường `kebab-case`.
Đây là lựa chọn phù hợp rule owner và code hiện tại; không cần đổi toàn bộ sang kebab-case để được coi là chuẩn.
Tên đặc biệt của framework và contract generated có ưu tiên riêng.

Có ba lớp cần phân biệt:

1. **Framework nhận diện theo tên**: `page.tsx`, `[slug]`, `proxy.ts` có semantics của Next.js.
2. **Ngôn ngữ/runtime và công cụ**: component identifier viết hoa, hook `useX`, glob test, import đúng casing.
3. **Policy của đội**: `ProductCard.tsx` hay `product-card.tsx`, `components` hay `ui`, singular/plural.

Nguồn: [Next structure](https://nextjs.org/docs/app/getting-started/project-structure), [React hooks](https://react.dev/learn/reusing-logic-with-custom-hooks), [rule owner](../../.claude/rules/core/typescript-react.md).

## Next.js bắt buộc gì?

Những tên dưới đây chỉ có ý nghĩa đặc biệt tại vị trí framework quy định; không cần tạo file nếu chưa có nhu cầu.

| Nhóm                   | Ví dụ và ý nghĩa                                                                     |
| ---------------------- | ------------------------------------------------------------------------------------ |
| Entry UI               | `page.tsx`, `layout.tsx`, `template.tsx`                                             |
| Trạng thái route       | `loading.tsx`, `error.tsx`, `global-error.tsx`, `not-found.tsx`                      |
| HTTP và parallel route | `route.ts`, `default.tsx`                                                            |
| Metadata               | `opengraph-image.tsx`, `robots.ts`, `sitemap.ts`; tên/extension theo từng convention |
| Dynamic                | `[slug]`, `[...slug]`, `[[...slug]]`                                                 |
| Group và private       | `(shop)` gom route mà không thêm URL segment; `_composition` loại khỏi routing       |
| Parallel/intercepting  | `@slot`, `(.)segment`, `(..)segment`, `(...)segment` theo routing convention         |
| Request proxy          | `proxy.ts` ngang cấp `app`, trong `src` nếu app ở `src/app`                          |

Nguồn: [Next structure và special files](https://nextjs.org/docs/app/getting-started/project-structure), [Proxy](https://nextjs.org/docs/app/api-reference/file-conventions/proxy).
Next 16 đổi tên Middleware thành Proxy; không từ đó suy ra phải rename file của một app chưa kiểm version/config.
Repo khai báo Next `^16.2.10` trong [package.json](../../package.json); tài liệu latest có thể đi trước bản cài thực tế.
Checkout dùng [src/proxy.ts](../../src/proxy.ts) (task 32 đổi tên theo quy ước Next 16).

`page.tsx` có thể export function `ProductsPage`: tên file framework và tên component không cần giống nhau.
Không đổi thành `Page.tsx` để áp PascalCase máy móc. Tương tự giữ `not-found.tsx`, không sửa thành `NotFound.tsx`.
Next cho phép colocate file thường trong route; chỉ entry convention làm route được truy cập.
[Next organization](https://nextjs.org/docs/app/getting-started/project-structure).

Checkout có `(auth)`, `(shop)`, `[id]`, `[locale]`, `[slug]`, `[token]`, `_composition`, `~offline`.
Các tên này không phải lỗi casing. `~offline` là route hiện hành; đổi tên có thể đổi URL/PWA fallback, cần kiểm owner trước.
Xem [architecture](../architecture/README.md), [source app](../../src/app).

## React và TypeScript không quyết định toàn bộ filename

React yêu cầu tên component bắt đầu bằng chữ hoa và custom hook bắt đầu `use` rồi chữ hoa.
Đó là **identifier**, không phải yêu cầu mọi basename `.tsx` phải PascalCase.
Docs React yêu cầu tên file có nghĩa và giải thích export/import, không đặt một casing bắt buộc cho mọi dự án.
[React hooks](https://react.dev/learn/reusing-logic-with-custom-hooks), [React modules](https://react.dev/learn/importing-and-exporting-components).

Ví dụ `product-card.tsx` export `ProductCard` vẫn không vi phạm yêu cầu tên component của React;
nhưng file mới đó **vi phạm policy hiện hành của repo**.
Tương tự `use-products.ts` có thể export `useProducts` về mặt JavaScript, nhưng owner ở đây yêu cầu `useProducts.ts`.
[Rule owner](../../.claude/rules/core/typescript-react.md).

Không tìm thấy quy định TypeScript phổ quát buộc application dùng kebab-case, PascalCase hoặc tiền tố `I`.
Trang Coding Guidelines của chính TypeScript nói rõ chỉ dành cho contributor của codebase TypeScript, không áp đặt cho cộng đồng.
Không lấy quy tắc nội bộ compiler thành tiêu chuẩn cho Storefront.
[TypeScript contributor guidelines](https://github.com/microsoft/TypeScript/wiki/Coding-guidelines).

TypeScript có `forceConsistentCasingInFileNames` để phát hiện import khác casing trên đĩa;
đây là consistency của đường dẫn, không phải lựa chọn kebab/Pascal.
[TSConfig](https://www.typescriptlang.org/tsconfig/forceConsistentCasingInFileNames.html).
[tsconfig.json](../../tsconfig.json) hiện không khai báo tường minh option này; không suy ra từ đó nó đang tắt hoặc đã được kiểm chứng bằng test.

## Bulletproof và FSD có cùng một chuẩn không?

Không. Bulletproof minh họa rule lint ép kebab-case file/folder như một lựa chọn để giữ nhất quán.
Đó không phải điều kiện từ React/Next. Cây feature của nó có `components`, `hooks`, `types`, `stores`, và chỉ tạo folder cần thiết.
Nó cũng cho phép tập trung API và khuyên import trực tiếp thay barrel.
[Bulletproof standards](https://github.com/alan2207/bulletproof-react/blob/master/docs/project-standards.md), [structure](https://github.com/alan2207/bulletproof-react/blob/master/docs/project-structure.md).

FSD chuẩn hóa một số segment như `ui`, `api`, `model`, `lib`, `config`; slice name phụ thuộc domain.
`model` có thể chứa schema, interface, store và business logic.
FSD khuyên không dùng `components`, `hooks`, `types` làm **segment** vì không diễn đạt mục đích đủ rõ.
Đây là guidance trong mô hình FSD, không phải lệnh cấm mọi folder đó trong mọi app React.
[FSD slices/segments](https://feature-sliced.design/docs/reference/slices-segments).

Vì vậy cây có `features/catalog/components` và `queries` ở ghi chú trước hợp hướng feature modular của repo,
nhưng không nên quảng bá là cây FSD nguyên bản. Không đổi riêng `components -> ui` rồi gọi migration FSD đã xong.

## Khảo sát tên đang được Git theo dõi

Phương pháp: `git ls-files src e2e`, chỉ giữ `.ts/.tsx`; bỏ extension rồi suffix `.test/.spec` để phân nhóm basename.
Không đếm file untracked, docs, config root hoặc script. Bao gồm generated contract và test; không coi nhóm casing là danh sách lỗi.

| Nhóm basename        | Số đường dẫn | Ví dụ                                                   |
| -------------------- | -----------: | ------------------------------------------------------- |
| PascalCase           |          103 | `ProductCard.tsx`, `AppProviders.test.tsx`              |
| camelCase có chữ hoa |           70 | `catalogUrlState.ts`, `useProducts.ts`                  |
| lowercase một từ     |          106 | `page.tsx`, `catalog.ts`, `auth.spec.ts`                |
| kebab-case           |           35 | `payment-config.ts`, `home-content.ts`, `not-found.tsx` |
| Dotted/khác          |            4 | `auth.store.ts`, `instrumentation.node.ts`              |
| Tổng                 |          318 | 58 `.test` và 9 `.spec`                                 |

Có 103 đường dẫn `.tsx` thuộc nhóm PascalCase trên; số này gồm test, không phải 103 production components.
Không có `index.ts(x)` tracked trong phạm vi khảo sát.
Folder thường đều lowercase/kebab; các ngoại lệ route đã liệt kê ở trên.

Các điểm cụ thể:

- [auth.store.test.ts](../../src/modules/auth/stores/auth.store.test.ts) kiểm [auth.store.ts](../../src/modules/auth/stores/auth.store.ts): stem test đã đồng dạng sau task 40.
- [payment-config.ts](../../src/modules/checkout/constants/payment-config.ts), [home-content.ts](../../src/modules/home/home-content.ts) là legacy kebab utility; file mới tương đương theo owner nên là `paymentConfig.ts`, `homeContent.ts`.
- [checkout-flow.test.tsx](../../src/modules/checkout/components/checkout-flow.test.tsx) đặt theo flow: được testing rule cho phép; không tự kết luận sai chỉ vì thiếu component cùng tên.
- [catalogUrlState.ts](../../src/modules/catalog/catalogUrlState.ts) và [useProducts.ts](../../src/modules/catalog/queries/useProducts.ts) đã đúng hướng camelCase/hook hiện hành.

Đây là inventory tĩnh, không phải kết quả lint/test toàn repo. Rule owner nói không bulk-rename legacy chỉ để đồng bộ hình thức.

## Policy thống nhất khuyến nghị

Bảng này giữ các quy định đã có; phần acronym/folder semantics là khuyến nghị bổ sung cần owner duyệt trước khi enforce.

| Đối tượng               | Tên nên dùng                                                            | Cơ sở                                            |
| ----------------------- | ----------------------------------------------------------------------- | ------------------------------------------------ |
| Component               | `ProductCard.tsx`, export `ProductCard`                                 | Rule owner                                       |
| Component test          | `ProductCard.test.tsx`                                                  | Owner + testing rule                             |
| Hook/query/mutation     | `useProducts.ts`, `useCreateOrder.ts`                                   | Owner; prefix React cho symbol                   |
| Hook test               | `useProducts.test.tsx` khi test render hook                             | Testing rule; extension theo JSX thực tế         |
| Utility/use case/mapper | `mergeCartItems.ts`, `variantResolution.ts`                             | Owner camelCase, intent cụ thể                   |
| Store                   | `cart.store.ts`; test `cart.store.test.ts`                              | Owner cho phép suffix này và pattern có sẵn      |
| Query key module        | `catalogKeys.ts`, export `catalogKeys`                                  | Owner camelCase + `<domain>Keys`                 |
| Schema module           | `checkoutSchema.ts`, export `CheckoutSchema`                            | File camelCase, value `<Name>Schema`             |
| Transport schema        | Domain file trong `src/integrations/backend/schemas`, giữ pattern owner | Không tạo DTO copy trong feature                 |
| Type tập hợp            | `types.ts` trong feature hoặc `order.ts`                                | Owner cho phép; chỉ tách khi có shared semantics |
| Interface/type/props    | `Product`, `ProductCardProps`; không `IProduct`                         | Owner rõ ràng                                    |
| Enum/trạng thái         | Union hoặc `as const`; không thêm TS `enum`                             | Owner cấm enum                                   |
| Constant toàn cục       | `ORDER_STATUS_OPTIONS`                                                  | Owner SCREAMING_SNAKE_CASE cho symbol            |
| Folder thường           | `product-detail`, `storefront-shell`                                    | Đề xuất thống nhất với route và folder hiện tại  |
| E2E                     | `e2e/checkout.spec.ts`, `hero-3d.spec.ts`                               | Testing owner                                    |

[TypeScript/React rule](../../.claude/rules/core/typescript-react.md), [testing rule](../../.claude/rules/process/testing.md), [project structure](../../.claude/rules/apps/project-structure.md).
Không áp `SCREAMING_SNAKE_CASE` của constant symbol cho filename; không thêm root `enums/`, `interfaces/`, `services/` chỉ vì có type mới.

Folder collection kỹ thuật dùng plural (`components`, `hooks`, `queries`, `schemas`, `stores`) theo cây đang có.
Capability/model không đếm được dùng singular hoặc tên riêng (`auth`, `catalog`, `checkout`, `model`, `ui`, `lib`).
Giữ vocabulary đang có: `orders`, `addresses` không cần đổi thành singular để trông giống `cart`.
Route `products` là collection URL; `[slug]` là param, không phải tên entity folder áp dụng toàn codebase.
Đây là semantics được đề xuất cho repo, không có quy tắc singular/plural bắt buộc chung từ Next/FSD.

Acronym đề xuất: `ApiErrorAlert`, `imageUrl`, `selectedSku`, `productId`, `productIds`, `PwaRegistration`;
constant vẫn `API_BASE_URL`. Viết từ rõ nghĩa, tránh `SKUResolver` ở file mới nếu đã chọn `SkuResolver` cùng boundary.
Không rename generated contract hoặc backend fields để đạt style; mapper chuyển tên khi semantics frontend cần.
Owner đã quy định suffix `Id`/`Ids`; casing acronym còn lại nên chốt bằng ví dụ khi cập nhật owner, không tuyên bố đã được lint enforce.

Đặt tên service theo việc làm: `createOrder`, `resolveVariant`, `mergeGuestCart`.
`catalog.ts` ở endpoints có owner rõ; không cần `CatalogService` chỉ để chuyển tiếp SDK.
Chỉ dùng `Service`/`Repository`/`Adapter` khi có trách nhiệm hoặc seam runtime thật, không thêm suffix để chứng minh SOLID.
[Rule SOLID](../../.claude/rules/core/solid-patterns.md).

## Server/client, tests và public entry

`ProductList.server.tsx` và `ProductsClient.tsx` là nhãn dành cho người đọc;
`.server`/`.client` không tự tạo boundary trong Next App Router.
Boundary dùng `'use client'`, graph import và `server-only`/`client-only` khi phù hợp.
[Next server/client](https://nextjs.org/docs/app/getting-started/server-and-client-components).
Nếu giữ `.server.tsx` làm convention bổ sung cần ghi ngoại lệ owner; hiện chưa nên coi là filename rule đã duyệt.

Vitest mặc định nhận cả `.test` và `.spec`; Playwright cũng vậy.
[Vitest include](https://vitest.dev/config/include), [Playwright testMatch](https://playwright.dev/docs/api/class-testconfig#test-config-test-match).
Ở đây [vitest.config.ts](../../vitest.config.ts) nhận `src/**/*.{test,spec}.{ts,tsx}` và loại `e2e`;
[playwright.config.ts](../../playwright.config.ts) đặt `testDir: './e2e'`, không override `testMatch`.
Vì vậy `.test` cạnh source và `.spec` ở E2E là policy của repo, không phải giới hạn của công cụ.
Next hướng dẫn Vitest nhưng hiện chưa hỗ trợ async Server Components; không dùng suffix test để suy ra đã kiểm RSC.
[Next Vitest](https://nextjs.org/docs/app/guides/testing/vitest).

Public entry phải là module cụ thể có owner, ví dụ `@/features/catalog/variantResolution` khi module đó được công bố cho consumer phù hợp.
Tên file rõ không tự cho phép import chéo feature; vẫn kiểm boundary, không deep-import private hoặc tạo `index.ts` barrel.
[Import rule](../../.claude/rules/core/imports-and-reuse.md).
FSD public API có mục tiêu che private internals; triển khai entry cụ thể ở repo này không có nghĩa đã áp toàn bộ FSD.
[FSD public API](https://feature-sliced.design/docs/reference/public-api).

## Chỉnh lại những tên đã đề xuất và chi phí chuyển đổi

- `merge-cart-items.ts` / `merge-guest-cart.ts` trong trao đổi nên thành `mergeCartItems.ts` / `mergeGuestCart.ts` nếu tạo mới theo owner hiện hành.
- Cây trước dùng `catalogUrlState.ts`, `variantResolution.ts`, `ProductsClient.tsx`, `useReservation.ts`: giữ được, không cần ép cùng casing giữa mọi loại file.
- `ProductList.server.tsx` cần giải thích runtime và ngoại lệ suffix như trên; có thể dùng `ProductList.tsx` mặc định server nếu chưa duyệt suffix.
- `model` hợp FSD nhưng không bắt buộc chuyển mọi feature vào đó; `components/hooks` vẫn hợp policy feature modular hiện tại.

Nếu chọn kebab-case toàn bộ, ít nhất 173 đường dẫn Pascal/camel trong inventory sẽ đổi basename, chưa tính dotted store và mọi reference/import/docs.
Đây là số file theo pattern, không phải ước lượng số giờ hay đề nghị rename 173 file.
Cần sửa owner trước, đặt ngoại lệ framework/generated, kiểm case-only rename bằng Git và chạy gate phù hợp cho từng slice.
Lợi ích đơn giản hóa casing chưa đủ bằng chứng để trả chi phí đó hiện nay.

Khuyến nghị thực hiện khi có task triển khai: áp rule hiện hành cho file mới; sửa tên legacy khi chạm cùng boundary;
chỉ thêm filename lint sau khi định nghĩa rõ ngoại lệ route, suffix và generated; không nhầm identifier lint với filename lint.
[eslint.config.mjs](../../eslint.config.mjs) có `@typescript-eslint/naming-convention` cho symbol, chưa có rule filename/folder tương ứng Bulletproof.
Ghi chú này không đổi config, tên source, import, route hoặc contract.
