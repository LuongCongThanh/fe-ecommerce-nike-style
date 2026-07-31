# PostgreSQL là primary database

Status: accepted

Backend dùng PostgreSQL làm primary database. Domain commerce cần relational integrity và transaction nhất quán cho Product/Variant/SKU, Inventory/Reservation và Order/OrderItem; PostgreSQL được chọn vì hỗ trợ constraint, locking và transaction isolation cần thiết để chống oversell. MongoDB và SQLite không phù hợp workload quan hệ/concurrency này, còn MySQL không mang lại lợi thế dự án cụ thể đủ để thay đổi lựa chọn. ORM/data-access và phiên bản PostgreSQL được chốt riêng.
