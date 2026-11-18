# Hướng dẫn kỹ thuật storefront

Xem [README](../README.md) để cài đặt, [AGENTS](../AGENTS.md) cho quy ước và [mục lục tài liệu](README.md) để tra cứu theo chủ đề.

## 27. three.js trong storefront

Hai điểm vào 3D hiện tại:

| Surface        | Component                                                            | Gate                                                 |
| -------------- | -------------------------------------------------------------------- | ---------------------------------------------------- |
| PDP            | `src/features/catalog/product-detail/components/ProductViewer3D.tsx` | `next/dynamic({ ssr: false })` từ `ProductInfoPanel` |
| Hero trang chủ | `src/features/home/components/hero3d/HeroSlides3D.tsx`               | `next/dynamic({ ssr: false })` + `useCanRender3D()`  |

Quy ước bắt buộc:

- **Không bao giờ** import `three` / `@react-three/*` từ một route hoặc layout dùng chung. WebGL không có
  server renderer, và chunk ~200 KB gz không được phép nằm trên đường găng của bất kỳ trang nào.
- Mọi surface 3D mới dùng `useCanRender3D()` trong `src/shared/hooks/`. Hook trả trạng thái `off`, `pending` hoặc `ready` cùng một `tier`. Hero lên lịch kiểm tra bằng `requestIdleCallback` hoặc timer dự phòng để hạn chế ảnh hưởng tới LCP. Nếu một điều kiện không đạt, Hero giữ chế độ 2D trong phiên đó.
- **`@react-three/drei` chỉ dùng ở PDP.** Hero cố tình chỉ dùng core `three` + fiber. Đặc biệt
  `Environment` fetch file HDR từ CDN pmndrs lúc runtime, không được dùng ở bất cứ đâu mới.
- Màu lấy từ design token qua `readTokenColor()`, không hardcode hex — nếu không dark mode sẽ chỏi.
- Mỗi scene phải: pause rAF khi tab ẩn hoặc ra khỏi viewport, về 2D vĩnh viễn khi `webglcontextlost`,
  và dispose texture/material khi unmount.
- Lớp WebGL chỉ được sở hữu **pixel**. Link, focus, ARIA, autoplay ở lại DOM — hero là ví dụ mẫu:
  carousel DOM giữ nguyên, canvas chỉ vẽ đè và ảnh DOM chuyển `opacity: 0` trong cùng một commit.

Hai cái bẫy đã mất thời gian, đừng dẫm lại:

- **Uniform phải tồn tại lúc `ShaderMaterial` được khởi tạo.** three chốt danh sách uniform khi link
  program lần đầu; đưa `<shaderMaterial>` cho reconciler rồi gán `.uniforms` sau đó sẽ link một program
  không bao giờ bind sampler → validate fail → canvas đen im lặng, không lỗi runtime.
- **Comment GLSL không được chứa backtick**, vì shader nằm trong template literal TS. Và `active` là từ
  khóa dành riêng của GLSL.

Đo LCP (production build, `next start`, Chromium 390×844, CPU throttle 4x, ~1.6 Mbps / 150 ms RTT,
trung vị 3 lần) — 2026-08-30:

|                                | LCP     |
| ------------------------------ | ------- |
| Hero có WebGL (canvas mount)   | 1524 ms |
| Hero gate tắt (reduced-motion) | 1516 ms |

Đây là baseline lịch sử của ba lần đo. Đo lại nếu thời điểm mount thay đổi.
