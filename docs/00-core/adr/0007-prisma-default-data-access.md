# Prisma là data-access mặc định

Status: accepted

Backend dùng Prisma làm ORM/data-access mặc định cho PostgreSQL, bao gồm schema, migrations và type-safe queries. Raw SQL được phép tại các critical path khi Prisma không biểu đạt đủ transaction, locking hoặc query đặc thù, nhưng phải được cô lập và có integration test; Drizzle, TypeORM và raw SQL toàn phần bị từ chối để ưu tiên đường học và tooling rõ ràng cho developer mới làm Backend. Không thêm generic repository abstraction trước khi xuất hiện nhu cầu thực tế.
