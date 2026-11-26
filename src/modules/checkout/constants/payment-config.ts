const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? '';

export const PAYMENT_CONFIG = {
  VNPAY: {
    VERSION: '2.1.0',
    COMMAND: 'pay',
    CURRENCY: 'VND',
    LOCALE: 'vn',
    ORDER_TYPE: 'other',
    RETURN_URL: `${appUrl}/api/payment/vnpay/callback`,
  },
  MOMO: {
    PARTNER_CODE: process.env.MOMO_PARTNER_CODE ?? '',
    REQUEST_TYPE: 'payWithMethod',
    REDIRECT_URL: `${appUrl}/payment/result`,
    IPN_URL: `${appUrl}/api/payment/momo/webhook`,
    LANG: 'vi',
  },
  ZALOPAY: {
    APP_ID: process.env.ZALOPAY_APP_ID ?? '',
    EMBED_DATA: '{}',
    CALLBACK_URL: `${appUrl}/api/payment/zalopay/webhook`,
  },
} as const;

export const PAYMENT_LABELS: Record<string, string> = {
  cod: 'Thanh toán khi nhận hàng',
  vnpay: 'VNPay',
  momo: 'Ví MoMo',
  zalopay: 'ZaloPay',
};
