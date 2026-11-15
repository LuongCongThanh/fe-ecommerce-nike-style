/** The 15 situations of D21 plus the status each leaves the task in (D23) and whether the human is told. */
export type TaskStatus = 'todo' | 'ready-for-agent' | 'in-progress' | 'needs-info' | 'blocked' | 'ready-for-human' | 'review' | 'done';

export interface SituationInfo {
  title: string;
  /** Status written to spec.md; null = no task involved */
  status: TaskStatus | null;
  notifyHuman: boolean;
}

export const SITUATIONS: Record<number, SituationInfo> = {
  1: { title: 'Không có task ready-for-agent', status: null, notifyHuman: true },
  2: { title: 'blocked-by chưa done', status: null, notifyHuman: false },
  3: { title: 'Gate đỏ trước khi agent bắt đầu / preflight lỗi / cổng dev bận', status: 'blocked', notifyHuman: true },
  4: { title: 'Worktree hoặc branch đã tồn tại mà không có state.json', status: 'blocked', notifyHuman: true },
  5: { title: 'Spec mơ hồ (need_info)', status: 'needs-info', notifyHuman: true },
  6: { title: 'Cần sửa file/lệnh ngoài quyền (needs_approval)', status: 'needs-info', notifyHuman: true },
  7: { title: 'Gate đỏ sau 3 lần sửa', status: 'blocked', notifyHuman: true },
  8: { title: 'Chạm hạn mức lượt', status: 'blocked', notifyHuman: true },
  9: { title: 'Hook chặn cùng tool + target 3 lần', status: 'needs-info', notifyHuman: true },
  10: { title: 'Có .agent-stop', status: 'ready-for-agent', notifyHuman: false },
  11: { title: 'Hết hạn mức gói, lỗi mạng hoặc claude crash', status: 'blocked', notifyHuman: true },
  12: { title: 'Push hoặc tạo PR lỗi', status: 'blocked', notifyHuman: true },
  13: { title: 'Tình huống khác', status: 'blocked', notifyHuman: true },
  14: { title: 'First Load JS tăng quá 10%', status: 'needs-info', notifyHuman: true },
  15: { title: 'Retro chạm 5 lượt chưa xong', status: 'needs-info', notifyHuman: true },
};

/** Thrown anywhere in the flow; `reportStop` turns it into status + inbox line + notification. */
export class Stop extends Error {
  constructor(
    readonly situation: number,
    /** What the human should do (goes in the inbox and the desktop notification) */
    readonly action: string,
    /** Raw detail (errors, questions): written to the log and the spec when relevant */
    readonly detail = '',
  ) {
    super(`situation ${situation}: ${action}`);
  }
}
