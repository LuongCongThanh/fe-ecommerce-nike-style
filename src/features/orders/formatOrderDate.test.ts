import { describe, expect, it } from 'vitest';

import { formatOrderDate } from '@/features/orders/formatOrderDate';

// Ngày/tháng một chữ số để thấy padding, giờ 14 để kiểm 24h, có giây (09) để kiểm việc bỏ giây.
const ISO = '2024-03-05T14:07:09Z';
const UTC = { timeZone: 'UTC' } as const;
const UTC_WITH_TIME = { timeZone: 'UTC', withTime: true } as const;

// Định dạng đã chốt (lấy từ kết quả chạy thật của Node trong repo):
// vi-VN: "dd/MM/yyyy", có giờ: "HH:mm dd/MM/yyyy"
// en-GB: "dd/MM/yyyy", có giờ: "dd/MM/yyyy, HH:mm"
describe('formatOrderDate', () => {
  it('formats a date only for vi', () => {
    expect(formatOrderDate(ISO, 'vi', UTC)).toBe('05/03/2024');
  });

  it('formats date and time for vi with the time first', () => {
    expect(formatOrderDate(ISO, 'vi', UTC_WITH_TIME)).toBe('14:07 05/03/2024');
  });

  it('formats a date only for en', () => {
    expect(formatOrderDate(ISO, 'en', UTC)).toBe('05/03/2024');
  });

  it('formats date and time for en with the date first', () => {
    expect(formatOrderDate(ISO, 'en', UTC_WITH_TIME)).toBe('05/03/2024, 14:07');
  });

  it.each(['fr', '', 'toString'])('falls back to the vi format for unknown locale %j', (locale) => {
    expect(formatOrderDate(ISO, locale, UTC)).toBe('05/03/2024');
    expect(formatOrderDate(ISO, locale, UTC_WITH_TIME)).toBe('14:07 05/03/2024');
  });

  it.each(['vi', 'en'])('shows 24h time without seconds or AM/PM for %s', (locale) => {
    const formatted = formatOrderDate(ISO, locale, UTC_WITH_TIME);

    expect(formatted).toContain('14:07');
    expect(formatted).not.toContain(':09');
    expect(formatted).not.toMatch(/AM|PM/i);
  });

  it.each(['not-a-date', ''])('returns an empty string for invalid ISO %j', (iso) => {
    expect(formatOrderDate(iso, 'vi', UTC)).toBe('');
    expect(formatOrderDate(iso, 'en', UTC_WITH_TIME)).toBe('');
  });
});
