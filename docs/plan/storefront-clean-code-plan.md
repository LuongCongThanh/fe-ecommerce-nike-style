# Đánh giá kiến trúc và kế hoạch clean code Storefront

Trạng thái **chờ review**. Baseline là checkout hiện tại, bao gồm cleanup đang nằm trong Git index và working tree. Kế hoạch này bổ sung phần kiểm kê mã, cấu hình và tài liệu cho [kế hoạch tái cấu trúc Storefront](storefront-restructure-plan.md). Thứ tự đưa nghiệp vụ lên API thật theo master plan ngày 14/11/2026. Thuật ngữ theo `be-demo/GLOSSARY.md`, đặc biệt **Biến thể**, **SKU**, **Tính thử**, **Dòng đơn hàng** và **Voucher**.

## 1. Danh sách xóa đề xuất

| Mục | Bằng chứng ở checkout | Đề xuất và điều kiện |
| --- | --- | --- |
| `public/{next,vercel,file,globe,window}.svg` | Không thấy tên file trong mã, test, manifest hay cấu hình được rà | Ứng viên xóa ưu tiên. Kiểm tra thêm tham chiếu qua URL động và nơi deploy phục vụ asset công khai |
| `src/shared/constants/auth-cookies.ts`, `src/core/session/roles.ts` và nhánh Admin trong `src/middleware.ts` | Cookie `is_admin` còn được đọc ở middleware. `isAdminRole` còn đi qua `useAuth` và test. Không thấy route Admin trong App Router | Gỡ cùng luồng role Admin cũ sau khi kiểm tra redirect và toàn bộ consumer. Giữ hành vi bảo vệ tài khoản và checkout hiện hành trong PR cleanup |
| Các hàm quản trị trong `src/lib/api/mocks/{catalog,order}-fixtures.ts` | Handler back-office đã được xóa. `createProduct`, `deleteProduct`, `getAllOrders` và `approveOrderReturn` không thấy consumer ngoài module. `findProductBySkuId` vẫn được gọi khi mô phỏng đặt đơn | Gỡ theo cụm hàm đã mất consumer. Giữ fixture chia sẻ với Giỏ hàng, Wishlist và Đơn hàng. Chạy test cho luồng MSW còn hoạt động |
| MSW, `public/mockServiceWorker.js`, Zod transport cũ | Luồng khách hàng và test vẫn gọi chúng | Gỡ theo từng contract thật. Xóa dependency ở lần cuối sau khi kiểm tra cả bootstrap, Vitest và Playwright |
| `pnpm-workspace.yaml`, file sinh OpenAPI và asset PWA | pnpm còn dùng `allowBuilds`/overrides. Generator và CI còn dùng type sinh. Manifest và worker có entry point riêng | Giữ. Chỉ xem xét đổi khi có phương án thay thế và kiểm tra tương ứng |

Trước mỗi đợt xóa, kiểm kê import và re-export, dynamic import, file convention Next.js, scripts/hooks/CI, CSS, URL asset, Playwright, Vitest và nguồn sinh. Kết quả scan unused là danh sách ứng viên. Với dependency, kiểm tra cả config và CLI trước khi sửa manifest và lockfile.

## 2. Cơ hội tăng depth

### A. Catalog và tìm kiếm — ưu tiên cao

- **Hiện tại.** `src/lib/api/endpoints/catalog.ts`, `src/lib/api/models/catalog.ts` và `app/[locale]/(shop)/_lib` cùng tham gia chuyển dữ liệu. Khi đổi filter hoặc Giá áp dụng, cần lần theo route, URL state, query và mapper.
- **Đề xuất.** Đưa logic chuyển URL, view model và trạng thái hiển thị vào các module catalog/search theo kế hoạch đích. Giữ transport chung và mapper đã có giá trị. Deletion test áp dụng cho wrapper chỉ chuyển tiếp tham số. Giữ module giữ quy tắc chuẩn hóa hoặc cấu hình cache.
- **Leverage và locality.** PLP, danh mục và search dùng nhất quán filter, phân trang và thứ tự. Dùng test hiện có và đi tay qua deep link, back/forward, PDP theo slug, kết quả trống và lỗi từ API ở cả `vi`/`en`.

### B. Session Người mua và transport — ưu tiên cao

- **Hiện tại.** `src/core/session/{AuthRuntimeProvider,auth-store,useAuth}`, `src/lib/api/client/{fetcher,runtime}` và `src/middleware.ts` chia nhau bootstrap, refresh và redirect. Adapter phải đăng ký trước bootstrap. Fetcher có cơ chế gộp refresh khi nhiều request trả 401.
- **Đề xuất.** Đưa session Người mua vào module auth và làm rõ seam với transport. Giữ quy tắc retry và cơ chế gộp refresh khi chuyển mã. Gỡ interface role Admin còn sót theo mục 1.
- **Leverage và locality.** Luồng gọi endpoint có chung hành vi khi hết phiên. Kiểm tra 401 đồng thời, refresh lỗi, logout, redirect hợp lệ, SSR và chuyển tài khoản. Chốt thuộc tính cookie khi có hợp đồng Người mua đã pin.

### C. Giỏ hàng, Tính thử và đặt Đơn hàng — ưu tiên theo Tier 1

- **Hiện tại.** `useCart.ts` vừa hydrate localStorage, vừa giữ Zustand, Gộp giỏ và tính tổng. Checkout/Đơn hàng còn chạy bằng endpoint và fixture mô phỏng. Interface hiện tại buộc caller biết khi nào Giỏ hàng đã hydrate và khi nào SKU đã resolve.
- **Đề xuất.** Chuyển quyền quyết định Giỏ hàng và Tính thử sang backend theo contract Tier 1. Tập trung logic form, hiển thị lỗi và xác nhận lại trong module checkout. Gỡ các adapter/mock cũ khi toàn bộ consumer tương ứng đã chuyển.
- **Leverage và locality.** Kiểm tra qua luồng Người mua thay vì thao tác trực tiếp store. Bao phủ Gộp giỏ sau login, nhiều tab, Tính thử hết hiệu lực, Voucher lỗi và retry đặt đơn cùng khóa idempotency. Chốt cách xử lý giỏ local cũ trước khi bật mua thật.

### D. UI, CSS và cấu hình — ưu tiên sau kiểm kê

- **Hiện tại.** UI primitives, layout và tiện ích nằm ở `src/components`, `src/shared` và thư mục theo route. Mã 3D, PWA, i18n và giám sát có entry point riêng.
- **Đề xuất.** Chuyển layout dùng chung theo cây đích. Chỉ hợp nhất module khi trùng hành vi và có cùng lý do thay đổi. Kiểm kê dependency qua import, CSS, file config và scripts. Đo bundle trước và sau nếu PR nhắm tới tải trang hoặc chia chunk.
- **Leverage và locality.** Giảm số nơi sửa hành vi dùng chung. Xác minh mobile/desktop, keyboard, locale, offline và 3D ở nơi có thay đổi. Giữ giao diện và URL khi PR chỉ di chuyển code.

## 3. Dọn tài liệu

| Tài liệu | Việc đề xuất |
| --- | --- |
| `README.md`, `AGENTS.md`, `CONTRIBUTING.md` | README sở hữu setup/env/lệnh. AGENTS sở hữu quy ước agent và bản đồ nguồn sự thật. CONTRIBUTING sở hữu quy trình Git và hook. Đối chiếu trực tiếp với manifest, CI và env mẫu |
| `docs/agents/domain.md`, `docs/agents/code-conventions.md`, `.claude/rules/` | Bỏ mô tả ba app cùng repo, alias `@repo/*` và Turbo. Cập nhật glob theo cây root. Kiểm tra rule `apps/admin-cms.md` và xóa cùng link điều hướng nếu chỉ còn giá trị lịch sử |
| `docs/FRONTEND-GUIDE.md`, `docs/roadmap/frontend-next-phase.md` | Guide cũ dài 946 dòng và roadmap vẫn theo Admin. Trích phần còn áp dụng vào tài liệu sở hữu tương ứng, sau đó đánh dấu lịch sử hoặc xóa khi đã kiểm tra inbound links |
| `design.md`, `docs/nike-ui-ux-analysis.md`, `docs/reference/nike-ui-ux-analysis.md` | Sửa đường dẫn token và stylesheet về root. Hai bản Nike khác nội dung. Đối chiếu phần duy nhất và ghi rõ bản nào dùng cho quyết định UI hiện tại |
| `docs/adr/`, `docs/plan/` | Giữ hồ sơ ADR, kể cả hai file có mã 0001. Chú thích trạng thái lịch sử ở trang điều hướng nếu cần. ADR mock-first vẫn giải thích adapter chuyển tiếp. Kế hoạch restructure giữ thứ tự nghiệp vụ, file này giữ checklist cleanup |

## 4. Thứ tự PR và nghiệm thu

1. **Baseline và cleanup đã stage.** Review diff xóa legacy trước khi gộp thêm việc. Ghi kết quả gates từ checkout thực tế và xác định phần nào chỉ thuộc cleanup trước đó.
2. **Mã thừa và tài liệu hiện hành.** Xóa asset/fixture có bằng chứng đủ, cập nhật tài liệu và rule có tham chiếu lỗi. Tách thay đổi hành vi middleware thành diff riêng để review redirect.
3. **Catalog/search rồi auth.** Dời từng cụm module. Giữ route, vi/en, SEO và hành vi người dùng. Đánh giá interface cụ thể sau khi chọn module.
4. **Giỏ hàng/checkout/Đơn hàng theo Tier 1.** Pin OpenAPI khi capability sẵn sàng, chuyển từng luồng và gỡ mock theo consumer. Các tier sau theo kế hoạch restructure.
5. **Hoàn tất.** Chạy frozen install, lint, format check, typecheck, test hiện có và build. Regenerate OpenAPI nếu đổi pin. Chạy Playwright hoặc đi tay cho luồng trình duyệt đã sửa, gồm lỗi và quyền sở hữu dữ liệu. So sánh link nội bộ, kiểm tra file convention và rà lại diff trước khi xóa đợt cuối.

Đề xuất duyệt mục 1–2 trước. Trong các hạng mục kiến trúc, catalog/search có thể triển khai trên API thật hiện có và cho phép xác minh trực tiếp trước khi chuyển Giỏ hàng.
