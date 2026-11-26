# Nghiên cứu cấu trúc Next.js cho Storefront

Ngày đối chiếu: 24/11/2026. Trạng thái: **khuyến nghị để thảo luận, chưa phải kiến trúc đã duyệt**. Phạm vi: tổ chức feature, server rendering và ranh giới kiểm thử; không đổi source, contract hoặc tài liệu owner. Đây là ghi chú nghiên cứu mới vì checkout chưa có thư mục research/reference. [Architecture](../architecture.md) vẫn sở hữu hiện trạng; [rule map](../agents/code-conventions.md) dẫn tới convention có hiệu lực.

## Kết luận đề xuất

Giữ `app` cho route/composition, `features` theo năng lực nghiệp vụ, `shared` cho thành phần thực sự dùng chung, `integrations/backend` cho SDK/contract. Bổ sung ranh giới server/client rõ tại nơi cần, không thay toàn bộ cây thành FSD hoặc Clean Architecture. Đây là đánh giá theo code hiện tại và chi phí chuyển đổi, không phải một tiêu chuẩn Next.js bắt buộc.

`model` là tên hợp lệ: FSD định nghĩa segment này chứa schemas, interfaces, stores và business logic. Vì thế không có căn cứ nói muốn SOLID thì phải đổi `model` thành bốn thư mục `types/constants/schemas/domain`. Tách theo trách nhiệm và lý do thay đổi; một module nhỏ có thể giữ type, constant và hàm liên quan cùng nhau. [FSD: slices/segments](https://feature-sliced.design/docs/reference/slices-segments).

## Bằng chứng trong checkout

`git status --short` ban đầu rỗng. Đây là khảo sát source tĩnh, không phải kết quả chạy ứng dụng hoặc benchmark.

| Source đã đọc                                     | Điều quan sát được                                                                                | Hệ quả cho thiết kế                                                                      |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `src/app/[locale]/(shop)/products/page.tsx`       | Async route đặt locale và compose `FilterSidebar`, `ProductsClient`; không đọc danh sách sản phẩm | Route là Server Component chưa đồng nghĩa dữ liệu catalog đã server-rendered             |
| `src/features/catalog/queries/useProducts.ts`     | Client hook resolve category, xây ProductQuery, giữ previous data                                 | Có owner query rõ; SSR cần tái sử dụng input/key và tránh request trùng                  |
| `src/integrations/backend/endpoints/catalog.ts`   | Endpoint và DTO mapper tập trung; URL khác giữa Node/browser                                      | Không cần thêm feature repository chỉ để chuyển tiếp request                             |
| `src/features/catalog/variantResolution.ts`       | Interface và logic resolve SKU cùng module thuần; có test cạnh file                               | Ví dụ trách nhiệm rõ mà không cần interface/service/class riêng                          |
| `src/features/checkout/queries/useCreateOrder.ts` | Hook phối hợp cart, order keys, endpoint, idempotency key và điều hướng                           | Cross-feature dependency có thật; áp FSD nguyên bản đòi hỏi thiết kế lại composition     |
| `src/features/checkout/queries/useReservation.ts` | Query được enable theo cart, tắt retry, có test cạnh hook                                         | Việc tách folder không tự bảo toàn semantics giữ chỗ                                     |
| `src/integrations/backend/client/runtime.ts`      | Auth adapter ở biến module, lifecycle đăng ký/cleanup                                             | Không dùng adapter token toàn cục này cho session riêng từng request SSR                 |
| `package.json`, `playwright.config.ts`            | Next `^16.2.10`, unit dùng Vitest, E2E ở `./e2e`                                                  | Docs Next latest có thể đi trước version được cài; kiểm API theo lockfile khi triển khai |

Rule hiện tại cấm direct fetch ngoài SDK, barrel `index.ts` mới và deep import private; transport validation thuộc `integrations/backend/schemas`. [Frontend architecture](../../.claude/rules/apps/frontend-architecture.md), [SOLID](../../.claude/rules/core/solid-patterns.md), [testing](../../.claude/rules/process/testing.md). Ghi chú này không tự thay các rule đó.

## So sánh bốn hướng

| Hướng                  | Bằng chứng nguồn sơ cấp                                                                                                                                                                                                                                                                             | Đánh giá cho checkout này                                                                                                                                                                             |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Route colocation       | Next cho phép đặt file cạnh route; chỉ special route files làm route public; private folder `_...` không tham gia routing. Framework không ép một cấu trúc duy nhất. [Next project organization](https://nextjs.org/docs/app/getting-started/project-structure)                                     | Hợp route adapter/loading/error/metadata. Đưa toàn bộ catalog dưới route sẽ khó chia sẻ PLP/PDP/search/home và dễ gắn domain với URL                                                                  |
| Feature/domain modular | Bulletproof gom code theo feature, chỉ tạo folder cần; cho phép API tập trung, khuyên compose feature ở app và tránh barrel. [Bulletproof source](https://github.com/alan2207/bulletproof-react/blob/master/docs/project-structure.md)                                                              | Gần cấu trúc hiện có, chi phí thấp nhất. Giữ vocabulary domain hiện hành; không mặc định mọi cross-feature import được phép                                                                           |
| FSD                    | Các layer có semantic chuẩn; slice chỉ import slice ở layer thấp hơn; không bắt buộc mọi layer. [FSD layers](https://feature-sliced.design/docs/reference/layers)                                                                                                                                   | Phù hợp khi nhiều nhóm cần chuẩn dependency mạnh. `features/catalog` hiện là domain lớn, khác nghĩa feature/action của FSD; thêm `entities/widgets/pages` là thay mô hình ownership, không chỉ rename |
| Clean/Hexagonal        | Clean yêu cầu dependency hướng vào policy và cho phép entity là data/functions. Hexagonal tách ứng dụng khỏi UI/thiết bị bằng port/adapter. [Clean](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html), [Hexagonal](https://alistair.cockburn.us/hexagonal-architecture) | Dùng cho logic có invariant hoặc adapter runtime thật. Áp đủ tầng cho mọi query tạo nhiều lớp chuyển tiếp, tăng chi phí mà chưa có bằng chứng lợi ích                                                 |

FSD public API bảo vệ phần private, thường minh họa bằng index; `@x` là ngoại lệ cross-import dành cho Entities, không phải giấy phép feature import nhau. [FSD public API](https://feature-sliced.design/docs/reference/public-api). Repo cấm barrel: nên chỉ định entry module cụ thể và enforce bằng lint thay vì sao chép `index.ts`. Đây là lựa chọn của repo, không tuyên bố đã áp FSD nguyên bản.

Bulletproof cũng không ủng hộ import chéo feature tùy ý. Vì vậy một `ProductCard` dùng ở home cần xem semantics: route/app có thể compose section catalog; nếu chỉ là card thuần cùng contract thì cân nhắc module dùng chung có owner. Không tự chuyển catalog business logic vào `shared`, cũng không deep-import nội bộ catalog từ home chỉ vì có reuse. [Bulletproof source](https://github.com/alan2207/bulletproof-react/blob/master/docs/project-structure.md).

## Cây cụ thể khuyến nghị

Cây dưới đây là đích minh họa có chọn lọc; chỉ tạo file/folder khi có code tương ứng. Không hàm ý phải di chuyển tất cả file ngay.

```text
src/
  app/
    _composition/                 # providers, phối hợp feature cấp app
    [locale]/(shop)/products/
      page.tsx                    # params/searchParams, locale, composition
      loading.tsx
      error.tsx
  features/
    catalog/
      components/                 # UI catalog dùng nhiều màn hình
      queries/                    # catalogKeys, client queries
      catalogUrlState.ts          # input URL dùng chung route/query
      variantResolution.ts        # types + invariant thuần cùng owner
      variantResolution.test.ts
      product-list/
        ProductList.server.tsx    # chỉ khi tách server reader/composition có ích
        components/
          ProductsClient.tsx      # tương tác URL/query
          ProductsClient.test.tsx
      product-detail/
        components/               # gallery, variant selector, buy interaction
        hooks/                    # state tương tác có tái sử dụng
      search/
        components/
        hooks/
    checkout/
      components/
      queries/
        useReservation.ts
        useReservation.test.tsx
      schemas/                    # form schema, không transport DTO
    auth/                         # browser session owner
    cart/
    orders/
    account/
    wishlist/
    home/
    storefront-shell/
  lib/
    api/
      generated/openapi.ts        # generated contract
      client/                     # transport, browser runtime adapter
      server/                     # request-scoped adapter nếu cần SSR riêng tư
      endpoints/                  # request + DTO mapping hiện hành
      models/                     # SDK-facing result types hiện hành
      mocks/
    schemas/                      # network contract validation
  shared/
    ui/
    lib/                          # capability cụ thể, không gom nghiệp vụ
  i18n/
  styles/
  testing/                        # setup + render helper
  pwa/
e2e/                              # journey trên app chạy thật
```

Giữ kiểu file hiện tại trong lần chuyển đầu để tránh rename hàng loạt. Nếu một feature sau này có nhiều business rules/stores/schemas khó điều hướng, `model/variantResolution.ts`, `model/cartState.ts` là lựa chọn hợp lý. Nếu hiện chỉ có vài module thuần thì để trực tiếp dưới feature. Không duy trì đồng thời `model` và `domain` cùng chứa một loại logic mà thiếu định nghĩa khác nhau.

## Enums, interfaces, schemas và services ở đâu?

Bảng này là khuyến nghị cho repo, không phải quy định từ Next/FSD.

| Loại                              | Vị trí và điều kiện                                                                                                                        |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Enum/union của API                | Generated contract hoặc transport schema; không định nghĩa lại giá trị backend ở UI                                                        |
| Tập trạng thái nghiệp vụ frontend | Module capability trong feature; union/typed mapping thường đủ. Dùng enum khi semantics hoặc interoperability cần, không tạo root `enums/` |
| Constant chỉ một consumer         | Cạnh consumer, private; nâng scope khi có chung semantics thật                                                                             |
| Component props/interface nhỏ     | Cạnh component. Không tạo file `interfaces/` cho mỗi props                                                                                 |
| View model/command                | Cạnh mapper/use case hoặc module feature có owner; tách DTO nếu semantics/nullability khác                                                 |
| Port/interface                    | Cạnh capability cần dependency inversion, khi có runtime implementations hoặc seam test có giá trị                                         |
| Transport schema                  | `src/integrations/backend/schemas`; generated TypeScript không thay runtime validation                                                     |
| Form schema                       | Feature `schemas/` hoặc module model tương ứng; không trộn form input với response DTO                                                     |
| Business rule thuần               | Module tên hành vi như `variantResolution.ts`, colocated test                                                                              |
| HTTP service                      | Function endpoint trong SDK hiện tại; không thêm `CatalogService -> CatalogRepository -> SDK` chuyển tiếp 1:1                              |
| Workflow nhiều bước               | Hook/controller nếu phụ thuộc React/cache/router; hàm use-case thuần và injected dependency nếu logic cần chạy độc lập React               |

SOLID được chứng minh bằng một lý do thay đổi, contract nhỏ, thay adapter giữ semantics, và dependency có thể kiểm thử. Số folder/class/interface không chứng minh các điều đó. Rule repo đã yêu cầu abstraction có consumer thật, enforcement boundary hoặc logic thuần đủ phức tạp. [SOLID rule](../../.claude/rules/core/solid-patterns.md). Clean cũng cho phép data structures/functions, không bắt buộc entity class. [Clean source](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html).

## Server/client và SDK

Next mặc định page/layout là Server Component; state, event và browser APIs cần client. Đặt `'use client'` thấp tại phần tương tác, truyền dữ liệu serializable qua boundary; dùng `server-only` cho module riêng server. Client Component vẫn có thể có HTML prerender ban đầu. [Next server/client](https://nextjs.org/docs/app/getting-started/server-and-client-components).

Khuyến nghị triển khai:

1. Ưu tiên public catalog/SEO để server đọc dữ liệu trước; URL là input chung cho server reader và client query. Chọn render props hoặc prefetch/dehydrate dựa trên nhu cầu client refetch, không dùng hai cache độc lập thiếu chính sách.
2. Vẫn đi qua `integrations/backend`; feature server module compose SDK, không tự gọi HTTP. Giữ browser token/refresh adapter tách request-scoped server transport; không đưa token cá nhân vào singleton hoặc cache public.
3. Xác định timeout/error, cache/revalidation và query key trước khi migrate PLP/PDP; tránh fetch cùng dataset lại ngay khi hydrate.
4. Giữ checkout/session/reservation theo semantics hiện có tới khi cookie/auth backend và cache riêng tư được xác minh. Đổi folder không giải quyết authentication cutover.
5. Không đánh dấu toàn feature `'use client'`; không import store/browser runtime từ server reader. Không thêm BFF/route handler chỉ để proxy 1:1 khi rewrite/SDK đã đáp ứng.

Đây là yêu cầu thiết kế cần kiểm chứng trong implementation, không phải mô tả checkout đã hỗ trợ SSR data hoặc session cookie.

## Kiểm thử có ý nghĩa

Unit/component/integration giữ `*.test.ts(x)` cạnh owner; chỉ setup và helper dùng chung ở `src/testing`. E2E giữ root `e2e` theo config. [Testing rule](../../.claude/rules/process/testing.md).

- Unit: resolve SKU khi thiếu trục/combination không tồn tại; URL parse invalid và reset pagination; mapper giữ đúng nullability/price semantics.
- Component: variant selection đổi CTA; form hiện lỗi; query UI loading/empty/error/retry bằng hành vi và accessible selectors.
- Integration: query + QueryClient + MSW chứng minh request filters và invalidation; reservation không tạo khi cart rỗng, không retry ngoài ý muốn; adapter server/browser giữ contract chung khi thật sự có hai implementation.
- E2E: SSR HTML có dữ liệu cần SEO trước tương tác, locale và deep-link filter; chọn SKU → cart → checkout; auth redirect/session theo contract đã có. Test hành trình có giá trị, không sao chép mọi unit case lên browser.

Vitest hiện chưa hỗ trợ async Server Components; Next khuyên E2E cho chúng. Có thể unit-test reader/mapper thuần, synchronous component và client interaction riêng, nhưng gọi async page như function không chứng minh RSC streaming/hydration. [Next Vitest guide](https://nextjs.org/docs/app/guides/testing/vitest).

## Chi phí và lộ trình quyết định

Ước lượng dưới đây là đánh giá tương đối, chưa phải thời gian cam kết.

| Phương án                            | Chi phí  | Rủi ro chính                                                                       |
| ------------------------------------ | -------- | ---------------------------------------------------------------------------------- |
| Giữ domain feature + SSR theo slice  | Thấp–vừa | Request/cache/session nếu tách runtime sai                                         |
| Dời mọi thứ vào route                | Vừa      | Khó reuse, churn import và ownership                                               |
| Chuyển FSD đầy đủ                    | Cao      | Phân lại domain/action/entity/widget, giải quyết cross-feature, lint và public API |
| Full Clean/Hexagonal cho mọi feature | Cao      | Layer chuyển tiếp, nhiều contract trùng và mocking quá mức                         |

Thứ tự khuyến nghị: ghi nhận quyết định và boundary → chọn public catalog làm slice thí điểm → giữ behavior/tests cũ, thêm SSR/E2E đúng ranh giới → đo request trùng và HTML/bundle thực → mở rộng khi có lợi ích. Không gộp migration kiến trúc với thay backend contract, auth cutover và redesign UI.

Chưa nên tách: root `types/interfaces/enums/services`, entity/repository cho mỗi endpoint, `model/domain/application/infrastructure` cho mọi feature, barrel toàn feature, package độc lập cho một consumer, hoặc thư mục rỗng để cây trông đầy đủ. Bước xác nhận tiếp theo là chọn đích feature modular và chiến lược server-data; ghi chú này chưa tự chốt thay người duyệt.
