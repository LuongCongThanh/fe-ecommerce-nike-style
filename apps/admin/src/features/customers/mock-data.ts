import type { Customer } from '@/features/customers/types';

/** Static seed — not real customer accounts (no admin-facing customers endpoint exists yet; see
 * `types.ts`). Only used to seed `localStorage` the first time. */
export const MOCK_CUSTOMERS: Customer[] = [
  { id: 'CUS-1001', name: 'Nguyễn Văn An', email: 'an.nguyen@example.com', phone: '0901234567', status: 'active', ordersCount: 12 },
  { id: 'CUS-1002', name: 'Trần Thị Bình', email: 'binh.tran@example.com', phone: '0912345678', status: 'active', ordersCount: 4 },
  { id: 'CUS-1003', name: 'Lê Hoàng Cường', email: 'cuong.le@example.com', phone: '0923456789', status: 'suspended', ordersCount: 0 },
  { id: 'CUS-1004', name: 'Phạm Thị Duyên', email: 'duyen.pham@example.com', phone: '0934567890', status: 'active', ordersCount: 7 },
  { id: 'CUS-1005', name: 'Vũ Minh Đức', email: 'duc.vu@example.com', phone: '0945678901', status: 'active', ordersCount: 1 },
];
