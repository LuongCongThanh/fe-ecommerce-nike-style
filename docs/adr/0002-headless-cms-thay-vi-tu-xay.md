# Dùng headless CMS bên thứ ba thay vì tự xây CMS

> Status: historical decision about content editing. No headless content CMS integration is claimed in this storefront; the separate commerce back-office repository is not evidence that this editor decision was implemented.

[đề xuất kiến trúc ban đầu](../reference/ideal.md) mô tả một module CMS tự xây (Landing Page Builder, Blog, Content Block, Campaign) như một trong ba trụ cột ngang hàng với Storefront/Admin. Chúng tôi quyết định **không** tự xây trình soạn thảo nội dung — tích hợp một headless CMS có sẵn (Sanity/Strapi/Contentful, lựa chọn cụ thể sẽ chốt khi bắt đầu module CMS) và để Storefront/Admin tiêu thụ nội dung qua API. Lý do: tự xây page builder/content editor tốn công sức không tương xứng với giá trị ở giai đoạn đầu, trong khi các headless CMS trưởng thành đã giải quyết tốt bài toán này.
