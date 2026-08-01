export const APP_CONFIG = {
  ITEMS_PER_PAGE: 20,
  MAX_CART_QUANTITY: 99,
  LOCALES: ['vi', 'en'] as const,
  DEFAULT_LOCALE: 'vi' as const,
} as const;

export const ORDER_STATUS_LABEL: Record<string, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  processing: 'Đang xử lý',
  shipped: 'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Đã huỷ',
};

export const PAYMENT_METHOD_LABEL: Record<string, string> = {
  cod: 'Thanh toán khi nhận hàng',
  vnpay: 'VNPay',
  momo: 'Momo',
  zalopay: 'ZaloPay',
};

export const ORDER_STATUS_COLOR_MAP: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-indigo-100 text-indigo-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export const SORT_OPTIONS = [
  { value: '-created_at', label: 'Mới nhất' },
  { value: 'price', label: 'Giá thấp → cao' },
  { value: '-price', label: 'Giá cao → thấp' },
  { value: 'rating', label: 'Đánh giá cao nhất' },
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number]['value'];
