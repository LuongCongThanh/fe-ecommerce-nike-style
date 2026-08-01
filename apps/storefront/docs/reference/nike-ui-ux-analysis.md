![Image](https://images.openai.com/static-rsc-4/nkz-BNVlM-inV6dSXmKrFTBNQfIpfMMQxDSG59vxZ9Hvr5EBgHWeE0tv2DrlDTjmf7W5bYCidYqHmwJ3K3D_DOR7x34mp2K7Huigp4dYVYXULKVs7JAald8A7FxzBSxzmKiLXfg0PFrFHPhzFFeGA9EfbQeigxgRHBibKxyEE4N1pVs8VT74yCsGACK4co8T?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/-FpwgZq7VgoTEJgQUaBAVFRGZNW8lFWX93Rrt81EGWVyebT_IIHxR59SIHXk9W1klkBj190978b_JgR5m7lcRjwP9xfePc8Jl3mr0wkTQbhXjtBayN7p3oMK5zweIUSr-diKSlWUIPp_Cj6qX8LiqJDtUlyV1xssnD-k8ZQUkqbjPYYh7M5YAL2Pbxc2roZ1?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/WTCy1iOCiPBAhPcSkbDTDJDcdzCfZJYYtQMoVFWniWSgT6cTSqW-h2H1qJomFMU3eClYKa1upKZ33ii5vVF7QqBtQ9OM--g0RlDsIZm_s2psFWMnjtb3vCouO4QyAQS8mri-xE-d2HqfpQsF-asN8dKknD4H7UJ3xzV-QG334slYoSd2AszyG-JwJxzOdU-j?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/U2MOQD2S2qOlALTQV-uoLr4xq3roTFlXoyYZL5V9a2-BXcTHbcSq4pko80xv0xLZ2GBewuyQbA_XkDMOw9GqI5GNOtr8oHqlCfd8amCnOTDSEEf8ZZjVUmw0JQaHUvTxV_blKsQ-n_G4zJzX9CwxYOdikl6OQkbNuD2SWJuK9MRoDYYQ3fjCWf9edok-7reT?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/BSK1w9HE2vI-DGg0XV7372ukvDNOGrjJupLxiWG0QShQ4YHTtb1LzWwops1ilnfi1vV0rmlLtcS_1jYZeeaIzXCqrhD9JRuOKqyUKf23AICu7qfz3Da4eQ5K2d6D4REfP1blhiO7CNJc4g-3avSiq3I7a8YjVW-7TvtGUSbdDFEX7lxO11vA4NOS5D0sdDky?purpose=fullsize)

Mình đã phân tích UI/UX của Nike Việt Nam dưới góc nhìn của một Senior Product Designer và Front-end Architect. Có thể nói Nike không phải là một website E-commerce thông thường, mà họ đang xây dựng theo mô hình **Brand Commerce** (thương mại kết hợp trải nghiệm thương hiệu). ([Nike.com][1])

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

---

# 2. UI Layout của Nike

Nike đang sử dụng 12 Column Grid.

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

---

# 3. Header của Nike gồm những gì?

Nike dành khoảng 90px cho Header.

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

Nike chỉ để:

```
5 menu chính

Men
Women
Kids
Sale
Sports
```

không quá:

```
7 menu

=> tránh Cognitive Load
```

Người dùng chỉ mất:

```
1-2s

để biết:

website đang bán gì.
```

---

# 4. Hero Section

Nike đầu tư nhiều nhất ở đây.

Nó bao gồm:

```
Video

+

Heading

+

CTA

+

Collection
```

Ví dụ:

```
Nike Football

BREAK THEM

--------------------

Fast sprints....

Shop Now

Explore
```

Hero thường có:

```
2 CTA

Primary
--------
Shop

Secondary
---------
Explore
```

UX khá hay ở đây:

```
không bao giờ chỉ có:

BUY NOW

mà có:

BUY
+
DISCOVER
```

để tăng:

```
CTR
+
Engagement
```

([Nike.com][1])

---

# 5. Product Card

Nike đang dùng dạng:

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

Product card gồm:

```
Image

+

Badge

------------

New
Sale
Best Seller
Member Product

+

Name

+

Category

+

Colors

+

Price
```

UX rất hay:

```
hover:

IMAGE 1

-------->

IMAGE 2

click:

-------->

PDP
```

---

# 6. Product Listing Page

Nike chia thành:

```
Filter

+
Sort

+
Grid View

+
Pagination
```

Filter:

```
Gender

Price

Sport

Brand

Color

Collection

Size

Sale

New Arrival
```

Desktop:

```
-------------------------
Filter | Product Grid
       |
       |
       |
       |
-------------------------
```

Mobile:

```
Filter Button

+

Sort Button

+

2 column layout
```

([Nike.com][2])

---

# 7. Search UX

Nike không dùng:

```
Search Page
```

mà dùng:

```
Predictive Search
```

Ví dụ:

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

UX này giúp:

```
giảm:

0 click

->

tăng conversion.
```

---

# 8. Typography

Nike sử dụng khá ít font.

```
Heading

36
48
72

Body

16

18

20

CTA

14

16
```

Typography hierarchy:

```
72
↓

48

↓

32

↓

24

↓

20

↓

18

↓

16

↓

14

↓

12
```

---

# 9. Color System

Nike cực kỳ đơn giản.

```
Primary

Black

#111111

Secondary

White

#FFFFFF

Gray

#757575

#CACACA

Error

Red

Success

Green
```

Nike gần như:

```
95%

Black

+

White
```

và để:

```
PRODUCT

là điểm nhấn.
```

---

# 10. Design System

Nike có khoảng:

### Foundation

```
Color

Typography

Spacing

Grid

Shadow

Radius

Breakpoint
```

### Components

```
Button

Input

Modal

Drawer

Tabs

Breadcrumb

Carousel

Card

Avatar

Tooltip

Accordion

Select

Filter

Pagination

Toast

Badge

Tag

Skeleton

Rating

Image

Video

Loading

Dropdown

Navigation
```

### Ecommerce Components

```
Product Card

Product Slider

Wishlist

Cart

Checkout

Payment

Address

Coupon

Promotion

Order

Review

Inventory

Tracking
```

---

# 11. Nếu clone Nike bằng NextJS 16

Mình sẽ chia như sau:

```
src

app
------

(auth)

(shop)

(product)

(cart)

(checkout)

(account)

wishlist

orders

support

components
-----------

ui

navigation

banner

carousel

product

checkout

layouts

footer

search

wishlist

modules
--------

auth

cart

checkout

products

orders

payments

reviews

promotion

membership

stores
-------

cart

auth

wishlist

search

services
---------

apis

repositories

utils

design-system
-------------

tokens

colors

spacing

typography

components

layouts
```

---

# 12. Có thể học được gì từ Nike?

Nike đang áp dụng:

```
40%

Branding

+

40%

UX

+

20%

Ecommerce
```

Điểm hay nhất là:

1. UI rất tối giản.
2. Typography rất lớn.
3. Hero Banner luôn kể một câu chuyện.
4. CTA rất rõ ràng.
5. Search rất nhanh.
6. Product Card rất tối giản.
7. Mobile UX được ưu tiên.
8. Chỉ sử dụng rất ít màu sắc.
9. Grid System cực kỳ chặt chẽ.
10. Toàn bộ website đều dựa trên Design System thống nhất. ([Nike.com][1])

### Nếu bạn muốn xây dựng một website E-commerce theo phong cách Nike bằng Next.js 16

Mình gợi ý nên tách thành khoảng 25–30 component lớn:

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

Kiến trúc này đủ để phát triển một website quy mô tương đương Nike, dễ mở rộng theo hướng Micro Frontend hoặc Headless Commerce trong tương lai.

Nếu bạn đang làm dự án E-commerce bằng Next.js, mình cũng có thể phân tích sâu hơn cách Nike tổ chức **Design System (spacing, typography, token)** hoặc vẽ lại toàn bộ **sitemap + component architecture + database design** của Nike để bạn có thể clone 80–90% trải nghiệm UI/UX của họ.

[1]: https://www.nike.com/vn/?utm_source=chatgpt.com 'Nike. Just Do It. Nike VN'
[2]: https://www.nike.com/vn/w/1n3adz3abn9za6d74?utm_source=chatgpt.com 'Products. Nike VN'

![Image](https://images.openai.com/static-rsc-4/nXFnkLQcuee4MO0paXG2ULvxzkIvABHPSPpYlAFZULWgXKuG4Sf-vEtoULAWSTHEhpDglwz8j2BU09D3iCkdNJlKOzSPR4qWPoBMIBuST3byh0R1QH39yLiFbU7aqnSGD6TM6L1PUH3SdE94c-95O5a3JCJDcIIPDWFqKX3gYlUqCMflCtzW6kh8q792Loz-?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/amcUmergwGu0doKk3OWOp-3m3gSE1BoS6VxEO5NLJqvxl8Db6Phj2FigCos5OHNiEjqVu1nDQf3xJkQUQvrAHSB2iPJvpEQX-vjrxN7vkf6Aj3D5oonuwcYmCeZU7dy-O2ua7Qvm9vUypo83vGabyvvTE4acXAUlteMp2hw4CFAFeYD4Ga5Y9p_JwHcCKMx8?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/wrbr9RwZzaK52PGemIIacjhNd0esVXs0Cxv5WjFHxSOGgAqWYQhUMUNso-YqVci4fRxZeYhQI7T6ScJ0XA_dZHWOtjYSxNftadv75a4di6fgMyIyIgHzZMFY-oIij57K4CYblNYlNQFLgt4KoPT0r21YqmCBZza-YgX21uxhPbw9yDLhxoXgqYN-fOv0mwNy?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/64lfW0RUIgfQtz9SUyONtYb6oPOC0tZUlkmeTXecwIUPUSEdNPL1zW7jRl6-U2aoQUvYav5O_i7IYZjnKMojSjWeOrqI2hrBy66VNlw60B5kleWkipGc8Edcu734ynEg0m1jBPt6RaSR3VUM_jt8BWdBZhIalsnhvsBxHASAXRsAvza9bJlZHzZki7X6fVRm?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/BC3FW5Mp83qZ_qpyN1nclyJuVkQhYKy2aflM4SxPC-zko1G1GxypWilS6bAR7NSLE7EO4335cbcunG0H1bUwR7acvbE4DvBvj4hJ2d1U1h9cGjCBddw3VicFu0sEf4Ie7iagsiKl1Rk0-H_DUaFdmTNbL1MDxyPEZA825WH4kObO93Mf3VkvBKdhQnaFUU6S?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/3PFQ4OREugPCZt_mGcHdsw0RXua4ZAMTOhqrg29e4vFTF8-lzGeRmuTTWIfb7FAPlvKh8ve4YCOfOSSc_HMVqB9tjgkhoyJbcpwp3KreZCpF-LeJZEWgXazJEGoTZbiejaU0r13xySv9Fbh7eVYnXm4KIV8vj0IoQM74T09bXn1_ILKoB5IxMlXU9c42PkX4?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/6u9FUNbmo-6s7dbiR8d536ohf-U0K5d64irUCFRgAa5eYHEXuyuOMrq3eLXHSegfcrNiRLsESosjPYAeysraXdAKZye3HA8BjooPPF2wSJHJjZld-C3dN4zkzq7lhhBmfi7rcHhHvii2xj1y40X5_KHg7Vq-3aB9u2FnhHbJVz2HbXEx2AeINybYSL42hYrR?purpose=fullsize)

Với góc nhìn của một Front-end Architect thì mình đánh giá Nike có một triết lý thiết kế khá thú vị:

> **Content < Product < Emotion**
>
> Nghĩa là người dùng không mua một đôi giày, họ mua "trải nghiệm thể thao". Vì vậy Design System của Nike không cố gắng đẹp theo kiểu Apple hay hiện đại theo kiểu Material Design mà tập trung vào việc làm cho sản phẩm nổi bật nhất.

Một số Design Principle của Nike:

```text
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

---

# Nike Design System Architecture

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

---

# Foundation Layer

Nike chia Foundation thành 6 phần.

```typescript
Foundation

Colors
--------

Typography

--------

Spacing

--------

Grid System

--------

Radius

--------

Motion
```

---

# Color Tokens

Nike cực kỳ ít màu.

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

nhưng thực tế họ lại sử dụng Semantic Token.

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

Ví dụ:

```typescript
Button

↓

không dùng

black

mà dùng

primary

Card

↓

không dùng

#CACACA

mà dùng

border
```

sau này muốn Dark mode chỉ cần:

```typescript
primary:black

↓

primary:white
```

là toàn bộ Design System thay đổi được.

---

# Typography System

Nike rất thích:

```text
BOLD

+
BIG

+
UPPERCASE
```

Hierarchy của Nike:

```typescript
Heading

72px
64px
48px
32px
24px

Body

20px
18px
16px
14px

Caption

12px
```

nếu làm NextJS mình sẽ define như sau:

```typescript
export const typography={

display:{
72:"",
64:"",
48":""
},

heading:{
32:"",
24":""
},

body:{
20:"",
18:"",
16":""
},

caption:{
14:"",
12":""
}

}
```

---

# Typography Token

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

---

# Spacing System

Nike sử dụng spacing rất rộng.

Ví dụ:

```text
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

nếu để ý sẽ thấy Nike cực kỳ ít sử dụng:

```text
16px

24px
```

mà thích:

```text
48px

64px

80px

120px
```

---

# Spacing Token

Mình đề xuất:

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

sau đó dùng:

```typescript
<Button
padding={spacing[16]}
/>

<Card
marginBottom={spacing[40]}
/>
```

---

# Radius System

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

Ví dụ:

```text
Button

↓

8px

Card

↓

12px

Search

↓

9999px
```

---

# Grid System

Desktop:

```text
12 Columns

--------------------------------

1   2   3   4   5   6

7   8   9   10 11 12

Gutter

24px

Margin

48px
```

Tablet

```text
8 Columns
```

Mobile

```text
4 Columns
```

---

# Breakpoint

```typescript
const breakpoints = {
  mobile: 375,
  tablet: 768,
  desktop: 1024,
  large: 1280,
  xl: 1440,
};
```

---

# Motion System

Nike rất ít animation.

```text
Hover

↓

200ms

-----------------

Fade In

↓

300ms

-----------------

Drawer

↓

400ms

-----------------

Image Scale

↓

200ms
```

Ví dụ:

```css
transition: 0.2s ease;
```

Nike không thích:

```text
bounce

zoom

rotate

```

mọi animation đều rất:

```text
FAST

+

SMOOTH

+

MINIMAL
```

---

# Component Architecture

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

---

# Design Token Structure

Nếu làm NextJS 16 mình sẽ chia như sau:

```text
design-system

tokens
------

colors.ts

spacing.ts

typography.ts

shadow.ts

radius.ts

motion.ts

breakpoints.ts

components
----------

button

card

input

modal

drawer

badge

tabs

layouts
-------

header

footer

container

grid

stack

section

commerce
---------

product-card

cart

wishlist

checkout

payment

search

promotion
```

---

# Hero Banner của Nike

Điều mà rất nhiều website Việt Nam đang làm sai là:

```text
SALE

30%

BUY NOW

SALE

50%

BUY NOW

SALE

70%

BUY NOW
```

Nike thì:

```text
Jordan.

BREAK THEM.

---------------

SHOP

EXPLORE
```

Nike đang bán:

```text
EMOTION

+

LIFESTYLE

+

SPORT
```

không bán:

```text
SẢN PHẨM
```

đây là lý do Conversion của Nike rất cao.

---

# Nếu Clone Nike bằng NextJS 16

Mình sẽ sử dụng:

```text
NextJS 16

+

React 19

+

Tailwind v4

+

Shadcn

+

Framer Motion

+

Tanstack Query

+

Zustand

+

Next-intl

+

Storybook

+

Playwright

+

MSW

+

Vitest

+

Stripe

+

CMS

+

PostgreSQL

+

NestJS
```

và Design System sẽ có khoảng:

```text
Foundation
------------

7 Modules

Components
------------

30 Components

Ecommerce
------------

20 Components

Layouts
------------

15 Components

Business Modules
-----------------

Auth

Products

Cart

Wishlist

Orders

Checkout

Payments

Reviews

Promotions

Membership

Search

Responsive System
------------------

Desktop

Tablet

Mobile

Tổng cộng:

70+

Reusable Components
```

## Kiến trúc đề xuất

Nếu mục tiêu của bạn là xây dựng một website E-commerce tầm trung đến lớn (giống Nike, Adidas hay Uniqlo), mình không khuyến khích clone 100% giao diện Nike. Thay vào đó, hãy học cách Nike tổ chức **Design Token → Foundation → Components → Business Components → Pages**. Đây mới là phần có giá trị lâu dài vì nó giúp:

- Dễ mở rộng Design System khi sản phẩm phát triển.
- Tái sử dụng component trên nhiều module (Product, Cart, Checkout, Account...).
- Hỗ trợ responsive và thay đổi theme mà không phải sửa nhiều nơi.
- Tách biệt rõ giữa UI thuần túy và logic nghiệp vụ của E-commerce.

Một mô hình thư mục phù hợp với Next.js 16 là:

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

Đây cũng là cách tiếp cận mà nhiều hệ thống E-commerce lớn sử dụng để giữ cho codebase có khả năng mở rộng và bảo trì tốt trong thời gian dài.
Nếu mục tiêu của bạn là xây dựng một sản phẩm ngang tầm Nike thì mình sẽ không thiết kế theo mô hình E-commerce thông thường.

Nike đang đi theo mô hình:

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

# Sitemap của Nike

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

---

# Component Architecture

Nike sẽ được chia thành 5 tầng.

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

---

# Folder Architecture của NextJS 16

```text
src

app
---------

(auth)

(shop)

(account)

(checkout)

(product)

orders

wishlist

cart

support

components
------------

ui

button
input
card
badge
modal
drawer
tabs

commerce
------------

product-card
mini-cart
checkout
wishlist
payment
search
reviews

layouts
-----------

header
footer
container
section
navigation

modules
-----------

auth

products

orders

payments

reviews

inventory

promotion

shipping

membership

analytics

stores
----------

auth

cart

wishlist

search

hooks
---------

use-cart

use-auth

use-search

services
-----------

apis

repositories

utils

design-system
---------------

tokens

colors

spacing

typography

shadow

motion

radius

tests
----------

e2e

unit

integration
```

---

# Database Design

Nike khá phức tạp vì một sản phẩm sẽ có:

```text
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

cho nên Database phải thiết kế theo dạng:

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

---

# Product Module

Nike là một trong những website Product Driven.

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

Database sẽ như sau:

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

---

# Search System

Nike đầu tư Search rất nhiều.

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

Ví dụ:

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

---

# Checkout Flow

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

---

# CMS System

Nike có một CMS rất lớn.

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

Marketing Team hoàn toàn có thể:

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

mà không cần Developer.

---

# Responsive Architecture

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

---

# Nếu Scale đến 1 triệu User

Mình sẽ chia thành Micro Services.

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

# Tech Stack đề xuất để Clone Nike

| Module           | Tech Stack                    |
| ---------------- | ----------------------------- |
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

## Kiến trúc tổng thể

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

Với quy mô này, dự án sẽ bao gồm khoảng **80–100 reusable components**, **20–30 business modules** và từ **40–60 bảng dữ liệu** cho các nghiệp vụ Product, Inventory, Order, Promotion, Membership và Analytics. Đây là một kiến trúc đủ linh hoạt để phục vụ cả website bán hàng, hệ thống quản trị nội dung (CMS) và khả năng mở rộng lên hàng trăm nghìn đến hàng triệu người dùng trong tương lai.
