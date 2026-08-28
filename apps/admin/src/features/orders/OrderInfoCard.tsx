import type { Order } from '@repo/schemas/order';
import { useTranslation } from 'react-i18next';

interface OrderInfoCardProps {
  readonly order: Order;
}

interface InfoRowProps {
  readonly label: string;
  readonly value: React.ReactNode;
}

function InfoRow({ label, value }: InfoRowProps): React.JSX.Element {
  return (
    <div className="space-y-0.5">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="text-foreground text-sm">{value}</p>
    </div>
  );
}

/**
 * Order summary sidebar card — every field is a real `Order` field (address/note/payment/dates), no
 * fabricated customer name/avatar/card-brand section (`OrderSchema` doesn't carry a customer relation
 * and MVP is COD-only, no payment gateway — Decision #7).
 */
export function OrderInfoCard({ order }: OrderInfoCardProps): React.JSX.Element {
  const { t, i18n } = useTranslation('order');
  const dateLocale = i18n.language === 'en' ? 'en-US' : 'vi-VN';

  return (
    <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3">
      <h2 className="text-foreground text-sm font-semibold">{t('orderInfo.title')}</h2>

      <InfoRow label={t('orderInfo.address')} value={order.address} />
      <InfoRow label={t('orderInfo.note')} value={order.note === '' ? t('orderInfo.noNote') : order.note} />
      <InfoRow label={t('orderInfo.paymentMethod')} value={t(`paymentMethodLabels.${order.payment_method}`)} />
      <InfoRow label={t('orderInfo.paymentStatus')} value={t(`paymentStatusLabels.${order.payment_status}`)} />
      <InfoRow label={t('orderInfo.createdAt')} value={new Date(order.created_at).toLocaleString(dateLocale)} />
      <InfoRow
        label={t('orderInfo.deliveredAt')}
        value={order.delivered_at === null ? t('orderInfo.notDeliveredYet') : new Date(order.delivered_at).toLocaleString(dateLocale)}
      />
    </div>
  );
}
