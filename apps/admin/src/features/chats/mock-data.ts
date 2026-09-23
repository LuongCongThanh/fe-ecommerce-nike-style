import type { Conversation } from '@/features/chats/types';

/** Static seed — a handful of representative internal-staff conversations. Only used to seed
 * `localStorage` the first time; every sent message after that persists (see `useChatsState`). */
export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    user: { id: 'u-thao', name: 'Nguyễn Thị Thảo', initials: 'NT' },
    messages: [
      { id: 'm1', sender: 'them', text: 'Đơn hàng #4821 khách báo chưa nhận được, anh check giúp em với.', timestampIso: '2026-08-20T09:12:00Z' },
      { id: 'm2', sender: 'me', text: 'Ok để anh xem log vận chuyển rồi báo lại.', timestampIso: '2026-08-20T09:15:00Z' },
    ],
  },
  {
    user: { id: 'u-hung', name: 'Trần Văn Hùng', initials: 'TH' },
    messages: [{ id: 'm3', sender: 'them', text: 'Kho báo sắp hết size M áo khoác, có nhập thêm không anh?', timestampIso: '2026-08-19T14:03:00Z' }],
  },
  {
    user: { id: 'u-linh', name: 'Phạm Thùy Linh', initials: 'PL' },
    messages: [{ id: 'm4', sender: 'me', text: 'Danh mục mới đã duyệt xong nhé.', timestampIso: '2026-08-18T11:30:00Z' }],
  },
];
