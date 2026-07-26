# Nike — Phân tích UI/UX và Kiến trúc Front-end

Phân tích UI/UX của Nike Việt Nam dưới góc nhìn Senior Product Designer và Front-end Architect. Nike không vận hành như một website E-commerce thông thường: họ xây dựng theo mô hình **Brand Commerce**, thương mại kết hợp trải nghiệm thương hiệu. ([Nike.com][1])

## 1. Kiến trúc tổng thể của Website

```
Nike.com
│
├── Announcement Bar
│
├── Header
│    ├── Logo
│    ├── Mega Menu
│    │      Men
│    │      Women
│    │      Kids
│    │      Sale
│    │      New & Featured
│    │      Sports
│    ├── Search
│    ├── Wishlist
│    ├── Cart
│    └── Account
│
├── Hero Banner
│      Video
│      Slider
│      CTA
│
├── Featured Collection
│
├── Trending Products
│
├── Product Showcase
│
├── Shop by Sport
│
├── Spotlight Collection
│
├── Membership
│
├── Footer Navigation
│
└── Social & Support
```

([Nike.com][1])

## 2. UI Layout của Nike

Nike dùng 12-column grid.

```
--------------------------------------------------
|                 Announcement                   |
--------------------------------------------------

| Logo | Men | Women | Kids | Sale | Search | ♥ |
--------------------------------------------------

|                                            |
|                                            |
|            HERO SECTION                    |
|                                            |
|        Video + CTA Button                  |
|                                            |
--------------------------------------------------

        FEATURED COLLECTION

--------------------------------------------------

        TRENDING PRODUCTS

--------------------------------------------------

     PRODUCT SLIDER (Horizontal Scroll)

--------------------------------------------------

        SHOP BY SPORT

--------------------------------------------------

        PRODUCT SPOTLIGHT

--------------------------------------------------

            MEMBERSHIP

--------------------------------------------------

               FOOTER

--------------------------------------------------
```

## 3. Header của Nike

Header chiếm khoảng 90px.

```
--------------------------------------------------
| Jordan | Converse | Store Finder | Help        |
--------------------------------------------------

| Nike Logo                               Search |
|
| Men | Women | Kids | Sale | New | Sports       |
|                              ♥      Cart        |
--------------------------------------------------
```

### UX rất hay

Nike giới hạn menu chính ở 5 mục, dưới ngưỡng 7 mục vốn được xem là giới hạn an toàn cho cognitive load:

- Men
- Women
- Kids
- Sale
- Sports

Người dùng mất 1-2 giây để hiểu website đang bán gì.

## 4. Hero Section

Đây là nơi Nike đầu tư nhiều nhất. Cấu trúc gồm bốn phần: video, heading, CTA, collection liên kết.

Ví dụ:

```
Nike Football

BREAK THEM

--------------------

Fast sprints....

Shop Now

Explore
```

Hero luôn dùng hai CTA:

- Primary: Shop
- Secondary: Explore

Nike không bao giờ dừng ở một nút BUY NOW. Họ luôn ghép BUY với DISCOVER, để tăng CTR và engagement. ([Nike.com][1])

## 5. Product Card

Nike dùng dạng card sau:

```
-----------------------
|                     |
|       IMAGE         |
|                     |
-----------------------
BEST SELLER

Air Jordan

Women's Shoes

3 colors

3.200.000đ

-----------------------
```

Card gồm: image, badge (New / Sale / Best Seller / Member Product), name, category, colors, price.

UX rất hay: hover đổi từ ảnh 1 sang ảnh 2, click mở PDP (Product Detail Page).

## 6. Product Listing Page

Nike chia PLP thành bốn khối: filter, sort, grid view, pagination.

Bộ filter gồm: Gender, Price, Sport, Brand, Color, Collection, Size, Sale, New Arrival.

Desktop: filter cố định bên trái, product grid bên phải.

```
-------------------------
Filter | Product Grid
       |
       |
       |
       |
-------------------------
```

Mobile: nút Filter và nút Sort phía trên, layout 2 cột bên dưới. ([Nike.com][2])

## 7. Search UX

Nike bỏ hẳn search page truyền thống, dùng Predictive Search: gõ đến đâu, gợi ý hiện đến đó.

```
Nike Air
↓
Air Force
↓
Air Max
↓
Jordan
↓
Pegasus
↓
Recent Search
↓
Trending Search
```

Cơ chế này giảm thao tác về gần 0 click, trực tiếp tăng conversion.

## 8. Typography — Kích thước sử dụng trên site

Nike dùng rất ít font.

- Heading: 36, 48, 72
- Body: 16, 18, 20
- CTA: 14, 16

Hierarchy tổng:

```
72 ↓ 48 ↓ 32 ↓ 24 ↓ 20 ↓ 18 ↓ 16 ↓ 14 ↓ 12
```

## 9. Color System

Bảng màu cực đơn giản:

- Primary — Black `#111111`
- Secondary — White `#FFFFFF`
- Gray — `#757575`, `#CACACA`
- Error — Red
- Success — Green

95% giao diện là Black + White, để sản phẩm làm điểm nhấn.

## 10. Design System — Kiểm kê Foundation & Component

### Foundation

Color, Typography, Spacing, Grid, Shadow, Radius, Breakpoint.

### Components

Button, Input, Modal, Drawer, Tabs, Breadcrumb, Carousel, Card, Avatar, Tooltip, Accordion, Select, Filter, Pagination, Toast, Badge, Tag, Skeleton, Rating, Image, Video, Loading, Dropdown, Navigation.

### Ecommerce Components

Product Card, Product Slider, Wishlist, Cart, Checkout, Payment, Address, Coupon, Promotion, Order, Review, Inventory, Tracking.

## 11. Cấu trúc thư mục Next.js 16 nếu clone Nike (bản rút gọn)

```
src
├── app
│   ├── (auth)
│   ├── (shop)
│   ├── (product)
│   ├── (cart)
│   ├── (checkout)
│   ├── (account)
│   ├── wishlist
│   ├── orders
│   └── support
├── components
│   ├── ui
│   ├── navigation
│   ├── banner
│   ├── carousel
│   ├── product
│   ├── checkout
│   ├── layouts
│   ├── footer
│   ├── search
│   └── wishlist
├── modules
│   ├── auth
│   ├── cart
│   ├── checkout
│   ├── products
│   ├── orders
│   ├── payments
│   ├── reviews
│   ├── promotion
│   ├── membership
│   └── stores
├── services
│   ├── apis
│   ├── repositories
│   └── utils
└── design-system
    ├── tokens
    ├── colors
    ├── spacing
    ├── typography
    ├── components
    └── layouts
```

## 12. Bài học rút ra từ Nike

Công thức của Nike: 40% Branding + 40% UX + 20% Ecommerce.

Mười điểm mạnh nhất:

1. UI tối giản.
2. Typography rất lớn.
3. Hero Banner luôn kể một câu chuyện.
4. CTA rõ ràng.
5. Search nhanh.
6. Product Card tối giản.
7. Mobile UX được ưu tiên.
8. Rất ít màu sắc.
9. Grid System chặt chẽ.
10. Toàn bộ website dựa trên Design System thống nhất. ([Nike.com][1])

### Đề xuất tách component nếu xây một site phong cách Nike bằng Next.js 16

Tách khoảng 25–30 component lớn:

| Module        | Components                                                   |
| ------------- | ------------------------------------------------------------ |
| Header        | Header, Mega Menu, Search, Announcement                      |
| Hero          | Hero Banner, Video Banner, CTA                               |
| Product       | Product Card, Product Slider, Product Gallery                |
| Category      | Shop By Sport, Collection, Trending                          |
| Cart          | Mini Cart, Cart Drawer                                       |
| Checkout      | Address, Payment, Shipping                                   |
| Account       | Profile, Orders, Wishlist                                    |
| CMS           | Promotion Banner, Dynamic Collection                         |
| Footer        | Footer Navigation, Social Links                              |
| Design System | Button, Input, Badge, Modal, Drawer, Tabs, Skeleton, Tooltip |

Kiến trúc này đủ để phát triển một website quy mô tương đương Nike, dễ mở rộng theo hướng Micro Frontend hoặc Headless Commerce.

Từ đây có thể đào sâu thêm hai hướng: cách Nike tổ chức Design System (spacing, typography, token), hoặc vẽ lại toàn bộ sitemap + component architecture + database design để clone 80–90% trải nghiệm UI/UX của họ.

[1]: https://www.nike.com/vn/?utm_source=chatgpt.com 'Nike. Just Do It. Nike VN'
[2]: https://www.nike.com/vn/w/1n3adz3abn9za6d74?utm_source=chatgpt.com 'Products. Nike VN'

## 13. Triết lý thiết kế: Content < Product < Emotion

Từ góc nhìn Front-end Architect, Nike theo đuổi một triết lý rõ ràng:

> **Content < Product < Emotion**
>
> Người dùng không mua một đôi giày, họ mua "trải nghiệm thể thao". Design System của Nike không chạy theo cái đẹp kiểu Apple hay hiện đại kiểu Material Design. Nó tập trung làm sản phẩm nổi bật nhất.

Chuỗi nguyên tắc thiết kế:

```
Minimal
↓
Bold
↓
Large Typography
↓
High Contrast
↓
Story Telling
↓
Immersive Experience
↓
Mobile First
↓
Fast Interaction
```

## 14. Kiến trúc Design System của Nike (sơ đồ tổng)

```text
Design System

        Foundation
            |
----------------------------------------
|               |               |       |
Color         Grid            Token   Motion
                |
            Typography
                |
            Spacing
                |
            Radius
                |
             Shadow
                |
-----------------------------------------

                Components
                      |
------------------------------------------
|          |          |         |         |
Button    Card      Input     Modal      Tabs
            |
         Product
            |
        Ecommerce
            |
------------------------------------------
|            |             |             |
Cart       Search        PDP           Checkout
            |
         Layout System
            |
------------------------------------------
|             |              |            |
Header       Hero          Footer      Mobile
```

## 15. Foundation Layer — 6 nền tảng

Nike chia Foundation thành 6 phần:

- Colors
- Typography
- Spacing
- Grid System
- Radius
- Motion

## 16. Color Tokens

Nike cực kỳ ít màu:

```typescript
const colors = {
  black: '#111111',
  white: '#FFFFFF',

  gray100: '#F5F5F5',
  gray200: '#E5E5E5',
  gray300: '#CACACA',
  gray400: '#757575',

  red: '#D33918',
  green: '#0F9D58',
};
```

Nhưng thực tế họ dùng Semantic Token:

```typescript
const semanticColors = {
  background: '',
  foreground: '',
  primary: '',
  secondary: '',
  border: '',
  muted: '',
  error: '',
  success: '',
  warning: '',
};
```

Ví dụ áp dụng: Button dùng token `primary`, không tham chiếu trực tiếp `black`. Card dùng token `border`, không tham chiếu trực tiếp `#CACACA`.

Muốn bật Dark Mode chỉ cần đổi `primary: black` thành `primary: white` — toàn bộ Design System đổi theo.

## 17. Typography System — Nguyên tắc & Hierarchy

Nike ưu tiên: Bold + Big + Uppercase.

Hierarchy của Nike:

- Heading: 72px, 64px, 48px, 32px, 24px
- Body: 20px, 18px, 16px, 14px
- Caption: 12px

Định nghĩa token nếu làm Next.js 16:

```typescript
export const typography = {
  display: {
    72: "",
    64: "",
    48: "",
  },

  heading: {
    32: "",
    24: "",
  },

  body: {
    20: "",
    18: "",
    16: "",
  },

  caption: {
    14: "",
    12: "",
  },
};
```

## 18. Typography Token

```typescript
export const fontWeight = {
  regular: 400,
  medium: 500,
  semiBold: 600,
  bold: 700,
};

export const lineHeight = {
  sm: 1.2,
  md: 1.5,
  lg: 1.7,
};

export const letterSpacing = {
  normal: '',
  wide: '',
  wider: '',
};
```

## 19. Spacing System

Nike dùng spacing rất rộng. Ví dụ:

```
Hero Banner
120px
↓
Collection
80px
↓
Trending
80px
↓
Product
64px
↓
Footer
```

Nike gần như không dùng 16px hay 24px. Họ ưu tiên 48px, 64px, 80px, 120px.

## 20. Spacing Token

```typescript
const spacing = {
  0: 0,

  4: 4,
  8: 8,
  12: 12,
  16: 16,
  20: 20,
  24: 24,

  32: 32,

  40: 40,
  48: 48,

  64: 64,
  80: 80,

  120: 120,
};
```

Cách dùng:

```typescript
<Button
padding={spacing[16]}
/>

<Card
marginBottom={spacing[40]}
/>
```

## 21. Radius System

Nike không thích bo góc quá nhiều.

```typescript
radius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};
```

Ví dụ áp dụng: Button 8px, Card 12px, Search 9999px (pill).

## 22. Grid System

Desktop:

```
12 Columns

--------------------------------
1   2   3   4   5   6
7   8   9   10 11 12

Gutter: 24px
Margin: 48px
```

Tablet: 8 columns.

Mobile: 4 columns.

## 23. Breakpoint

```typescript
const breakpoints = {
  mobile: 375,
  tablet: 768,
  desktop: 1024,
  large: 1280,
  xl: 1440,
};
```

## 24. Motion System

Nike dùng rất ít animation:

```
Hover        → 200ms
Fade In      → 300ms
Drawer       → 400ms
Image Scale  → 200ms
```

```css
transition: 0.2s ease;
```

Nike tránh bounce, zoom, rotate. Mọi animation đều fast, smooth, minimal.

## 25. Component Architecture — Chuỗi phụ thuộc

```text
Design System
↓
Button
↓
Card
↓
Input
↓
Modal
↓
Drawer
↓
Carousel
↓
Badge
↓
Image
↓
Video
↓
Avatar
↓
Tooltip
↓
Pagination
↓
Tabs
↓
Business Components
↓
Product Card
↓
Product Gallery
↓
Mini Cart
↓
Wishlist
↓
Checkout
↓
Payment
↓
Review
↓
Order
```

## 26. Design Token Structure

Nếu làm Next.js 16, cấu trúc `design-system/`:

```text
design-system
├── tokens
│   ├── colors.ts
│   ├── spacing.ts
│   ├── typography.ts
│   ├── shadow.ts
│   ├── radius.ts
│   ├── motion.ts
│   └── breakpoints.ts
├── components
│   ├── button
│   ├── card
│   ├── input
│   ├── modal
│   ├── drawer
│   ├── badge
│   └── tabs
├── layouts
│   ├── header
│   ├── footer
│   ├── container
│   ├── grid
│   ├── stack
│   └── section
└── commerce
    ├── product-card
    ├── cart
    ├── wishlist
    ├── checkout
    ├── payment
    ├── search
    └── promotion
```

## 27. Hero Banner của Nike — Bán cảm xúc, không bán giảm giá

Sai lầm phổ biến ở nhiều website Việt Nam:

```
SALE 30%   BUY NOW
SALE 50%   BUY NOW
SALE 70%   BUY NOW
```

Nike thì:

```
Jordan.

BREAK THEM.

---------------

SHOP

EXPLORE
```

Nike bán EMOTION + LIFESTYLE + SPORT. Không bán SẢN PHẨM. Đây là lý do conversion của Nike rất cao.

## 28. Clone Nike bằng Next.js 16 — Tech Stack & Quy mô Design System

Stack đề xuất:

```
Next.js 16 + React 19 + Tailwind v4 + Shadcn + Framer Motion
+ TanStack Query + Zustand + next-intl + Storybook + Playwright
+ MSW + Vitest + Stripe + CMS + PostgreSQL + NestJS
```

Quy mô Design System ước tính:

- Foundation: 7 modules
- Components: 30 components
- Ecommerce: 20 components
- Layouts: 15 components
- Business Modules: Auth, Products, Cart, Wishlist, Orders, Checkout, Payments, Reviews, Promotions, Membership, Search
- Responsive System: Desktop, Tablet, Mobile
- Tổng: 70+ reusable components

### Kiến trúc đề xuất

Nếu mục tiêu là xây một E-commerce tầm trung đến lớn (giống Nike, Adidas hay Uniqlo), không nên clone 100% giao diện Nike. Học cách Nike tổ chức **Design Token → Foundation → Components → Business Components → Pages** — đây là phần có giá trị lâu dài, vì nó giúp:

- Dễ mở rộng Design System khi sản phẩm phát triển.
- Tái sử dụng component trên nhiều module (Product, Cart, Checkout, Account...).
- Hỗ trợ responsive và đổi theme mà không phải sửa nhiều nơi.
- Tách biệt rõ UI thuần túy và logic nghiệp vụ E-commerce.

Mô hình thư mục phù hợp với Next.js 16:

```text
tokens
   ↓
foundation
   ↓
ui-components
   ↓
commerce-components
   ↓
layouts
   ↓
features/modules
   ↓
pages
```

Đây là cách tiếp cận mà nhiều hệ thống E-commerce lớn dùng để giữ codebase mở rộng và bảo trì tốt trong thời gian dài.

## 29. Mô hình vận hành tổng thể của Nike

Với một sản phẩm ngang tầm Nike, thiết kế không dừng ở mô hình E-commerce thông thường. Nike vận hành theo mô hình sau:

```text
Nike.com

            CMS
             |
         Marketing
             |
          Collection
             |
-----------------------------------------
|            |            |              |
 Products    Search      Member         Sale
     |           |           |             |
 Product      AI Search    Wishlist      Coupon
 Listing         |             |             |
     |         History       Orders       Promotion
 Product         |              |
 Detail        Trending       Profile
     |
 Reviews
     |
 Variant
     |
 Inventory
     |
-----------------------------------------
               |
              Cart
               |
           Checkout
               |
             Order
               |
            Payment
               |
            Shipping
               |
            Tracking
               |
            Refund
               |
------------------------------------------
               |
            Analytics
               |
            Dashboard
```

## 30. Sitemap của Nike

```text
Nike.com
│
├── Home
│
├── New & Featured
│      |
│      ├── New Arrival
│      ├── Best Seller
│      ├── Trending
│      ├── Member Exclusive
│      └── Sale
│
├── Men
│      |
│      ├── Shoes
│      ├── Clothing
│      ├── Accessories
│      └── Sports
│
├── Women
│
├── Kids
│
├── Sports
│      |
│      ├── Running
│      ├── Football
│      ├── Basketball
│      ├── Training
│      └── Lifestyle
│
├── Collections
│      |
│      ├── Air Jordan
│      ├── Air Max
│      ├── Dunk
│      ├── Pegasus
│      └── Limited Edition
│
├── Search
│
├── Wishlist
│
├── Cart
│
├── Checkout
│      |
│      ├── Address
│      ├── Shipping
│      ├── Payment
│      └── Coupon
│
├── Orders
│
├── Profile
│
├── Membership
│
└── Support
```

## 31. Component Architecture — 5 tầng phân lớp

Kiến trúc component của Nike chia thành 5 tầng: Page Layer, Feature Layer, Business Layer, UI Layer, Token Layer.

```text
                 APP

                  |
            PAGE LAYER
                  |
-----------------------------------
|             |                  |
 Home        Product            Cart
              |                  |
           Checkout            Profile
                  |
-------------------------------------

            FEATURE LAYER

-------------------------------------

Products

Wishlist

Search

Cart

Orders

Payments

Reviews

Coupons

Promotion

Membership

Analytics

-------------------------------------

           BUSINESS LAYER

--------------------------------------

Product Service

Order Service

Payment Service

Search Service

Review Service

Promotion Service

Inventory Service

Shipping Service

-------------------------------------

            UI LAYER

--------------------------------------

Button

Input

Card

Image

Badge

Tabs

Modal

Drawer

Avatar

Tooltip

Pagination

Carousel

Accordion

Dropdown

Skeleton

Toast

-------------------------------------

            TOKEN LAYER

-------------------------------------

Colors

Spacing

Typography

Radius

Shadow

Grid

Animation

Breakpoint

-------------------------------------
```

## 32. Folder Architecture của Next.js 16 (đầy đủ)

```text
src
├── app
│   ├── (auth)
│   ├── (shop)
│   ├── (account)
│   ├── (checkout)
│   ├── (product)
│   ├── orders
│   ├── wishlist
│   ├── cart
│   └── support
├── components
│   ├── ui
│   │   ├── button
│   │   ├── input
│   │   ├── card
│   │   ├── badge
│   │   ├── modal
│   │   ├── drawer
│   │   └── tabs
│   └── commerce
│       ├── product-card
│       ├── mini-cart
│       ├── checkout
│       ├── wishlist
│       ├── payment
│       ├── search
│       └── reviews
├── layouts
│   ├── header
│   ├── footer
│   ├── container
│   ├── section
│   └── navigation
├── modules
│   ├── auth
│   ├── products
│   ├── orders
│   ├── payments
│   ├── reviews
│   ├── inventory
│   ├── promotion
│   ├── shipping
│   ├── membership
│   └── analytics
├── stores
│   ├── auth
│   ├── cart
│   ├── wishlist
│   └── search
├── hooks
│   ├── use-cart
│   ├── use-auth
│   └── use-search
├── services
│   ├── apis
│   ├── repositories
│   └── utils
├── design-system
│   ├── tokens
│   ├── colors
│   ├── spacing
│   ├── typography
│   ├── shadow
│   ├── motion
│   └── radius
└── tests
    ├── e2e
    ├── unit
    └── integration
```

## 33. Database Design

Một sản phẩm như Air Jordan đã kéo theo quy mô dữ liệu lớn:

```
Air Jordan
↓
15 Size
↓
8 Colors
↓
3 Collections
↓
2 Promotions
↓
5000 Inventory
↓
200 Reviews
↓
500 Images
↓
10 Videos
```

Nên database phải thiết kế theo dạng:

```text
                  USERS
                     |
                 PROFILE
                     |
------------------------------------------
|                   |                    |
Wishlist            Cart               Orders
    |                |                    |
 Cart Item         Cart Item             Payment
                     |                    |
------------------------------------------
                     |
                 PRODUCTS
                     |
------------------------------------------
|                   |                    |
Categories         Brand               Reviews
                     |
-------------------------------------------
                     |
                  Variant
                     |
--------------------------------------------
|                  |                         |
Colors             Size                    Images
                     |
---------------------------------------------
                     |
                 Inventory
                     |
---------------------------------------------
                     |
                 Promotion
                     |
---------------------------------------------
                     |
                  Coupon
                     |
---------------------------------------------
                     |
                  Orders
                     |
---------------------------------------------
                     |
                 Shipping
                     |
---------------------------------------------
                     |
                 Tracking
                     |
---------------------------------------------
                     |
                 Refund
                     |
---------------------------------------------
                     |
                Notification
                     |
---------------------------------------------
                     |
                 Analytics
```

## 34. Product Module

Nike là một site product-driven:

```text
Product
↓
Product Detail
↓
Category
↓
Brand
↓
Collection
↓
Variant
↓
Color
↓
Size
↓
Inventory
↓
Images
↓
Videos
↓
Review
↓
Promotion
↓
Recommendation
↓
Analytics
```

Schema đề xuất:

```sql
products

id
slug
name
description
brand_id
category_id
status
price
created_at

-------------------

product_variants

id
product_id
sku
size
color
price
quantity

-------------------

product_images

id
product_id
url
position

-------------------

reviews

id
product_id
user_id
rating
comment

-------------------

inventory

id
product_id
quantity
warehouse_id
```

## 35. Search System

Nike đầu tư mạnh cho Search:

```text
Search
↓
Trending
↓
History
↓
Popular
↓
Collection
↓
Recommendation
↓
Suggestion
↓
AI Search
↓
Filter
↓
Sorting
```

Ví dụ mở rộng truy vấn:

```text
Air
↓
Air Jordan
↓
Air Max
↓
Pegasus
↓
Running
↓
Men
↓
Black Shoes
↓
Trending Search
```

## 36. Checkout Flow

```text
Add To Cart
↓
Mini Cart
↓
Cart Page
↓
Address
↓
Shipping
↓
Coupon
↓
Payment
↓
Review Order
↓
Checkout
↓
Order Success
↓
Tracking
↓
Delivery
↓
Refund
```

## 37. CMS System

Nike vận hành một CMS lớn:

```text
CMS
↓
Banner
↓
Hero
↓
Promotion
↓
Collections
↓
Flash Sale
↓
Trending
↓
Campaign
↓
Blogs
↓
Stories
↓
SEO
↓
Analytics
↓
Recommendation
```

Marketing Team tự vận hành toàn bộ chuỗi sau mà không cần Developer:

```text
Upload
↓
Video
↓
Images
↓
Collections
↓
Promotions
↓
Hero Banner
↓
SEO
↓
Landing Page
```

## 38. Responsive Architecture

```text
Desktop
↓
1440
↓
1280
↓
1024

------------------

Tablet
↓
768

------------------

Mobile
↓
390
↓
375
↓
360
```

## 39. Kiến trúc Microservices nếu Scale đến 1 triệu User

```text
                 API GATEWAY
                       |
-------------------------------------------------

Auth

Products

Search

Orders

Inventory

Payment

Promotion

Shipping

Reviews

Analytics

CMS

Notification

-------------------------------------------------

                      |
                  PostgreSQL

                      |
--------------------------------------------------

Redis

Elastic Search

S3 Storage

CDN

Queue

Kafka

--------------------------------------------------

                    Frontend

---------------------------------------------------

NextJS
↓
Web
↓
PWA
↓
Mobile
↓
CMS
↓
Admin Dashboard
```

## 40. Tech Stack đề xuất để Clone Nike (bảng chi tiết)

| Module           | Tech Stack                    |
| ---------------- | ------------------------------ |
| Front-end        | NextJS 16                     |
| UI               | Tailwind v4                   |
| Design System    | Storybook                     |
| State Management | Zustand                       |
| Server State     | TanStack Query                |
| Testing          | Playwright + Vitest           |
| Backend          | NestJS                        |
| Database         | PostgreSQL                    |
| Cache            | Redis                         |
| Search           | Elasticsearch                 |
| Storage          | S3 Compatible Storage         |
| Queue            | Kafka hoặc RabbitMQ           |
| Payment          | Stripe, VNPay, MoMo, ZaloPay  |
| CMS              | Headless CMS hoặc tự xây dựng |
| Analytics        | GA4 + Internal Analytics      |
| CI/CD            | GitHub Actions                |
| Deployment       | Docker + Kubernetes           |

### Kiến trúc tổng thể

```text
                 NIKE CLONE

                    |
               Design System
                    |
               70 Components
                    |
               15 Layouts
                    |
                25 Modules
                    |
                 NextJS 16
                    |
                 NestJS
                    |
               PostgreSQL
                    |
                  Redis
                    |
              Elasticsearch
                    |
                 Storage
                    |
                  Queue
                    |
                 Payment
                    |
                  CMS
                    |
               Analytics
                    |
                Admin CMS
                    |
                 Mobile
                    |
                   PWA
```

Với quy mô này, dự án bao gồm khoảng **80–100 reusable components**, **20–30 business modules** và **40–60 bảng dữ liệu** cho các nghiệp vụ Product, Inventory, Order, Promotion, Membership và Analytics. Đây là một kiến trúc đủ linh hoạt để phục vụ cả website bán hàng, hệ thống quản trị nội dung (CMS) và khả năng mở rộng lên hàng trăm nghìn đến hàng triệu người dùng trong tương lai.
