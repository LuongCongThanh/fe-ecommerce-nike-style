import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

/** One `cn`, defined in `@repo/ui` where the components that use it live. It used to be implemented
 * twice — identically — here and there; this re-export keeps the 49 `@repo/shared/utils` call sites
 * working without a second implementation behind them. */
export { cn } from '@repo/ui/cn';

function isQueryValue(value: unknown): value is string | number | boolean {
  return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'dd/MM/yyyy', { locale: vi });
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), 'HH:mm dd/MM/yyyy', { locale: vi });
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function appendArrayParam(searchParams: URLSearchParams, key: string, value: unknown[]): void {
  for (const item of value) {
    if (item != null && item !== '' && isQueryValue(item)) {
      searchParams.append(key, String(item));
    }
  }
}

export function buildQueryString(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value == null || value === '') continue;
    if (Array.isArray(value)) {
      appendArrayParam(searchParams, key, value);
    } else if (isQueryValue(value)) {
      searchParams.set(key, String(value));
    }
  }

  return searchParams.toString();
}

export function truncateText(text: string, maxLength: number): string {
  if (maxLength <= 0) return '';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, Math.max(0, maxLength - 3)).trimEnd()}...`;
}

export function validateVietnamesePhone(phone: string): boolean {
  const normalizedPhone = phone.trim();
  const vietnamPhoneRegex = /^(0|\+84)(3[2-9]|5[6-9]|7[06-9]|8[1-9]|9[0-9])\d{7}$/;
  return vietnamPhoneRegex.test(normalizedPhone);
}
