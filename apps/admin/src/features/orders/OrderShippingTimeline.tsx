import type { Order } from '@repo/schemas/order';
import { Check } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { ORDER_TIMELINE_STEPS } from '@/features/orders/orderStatusVariant';

interface OrderShippingTimelineProps {
  readonly order: Order;
}

/**
 * Renders the order's progress along the real linear MVP state machine (PENDING → PROCESSING →
 * PACKED → SHIPPED → DELIVERED, see `OrderStatusSchema`'s doc comment) — every step shown is derived
 * from `order.status`, never an invented event log (docs/FRONTEND-GUIDE.md §14 Honest UI; design
 * reference: Sneat admin template's order-detail "Shipping Activity" timeline).
 *
 * CANCELLED/RETURN_REQUESTED/RETURNED are branches off this line, not steps on it — there's no
 * meaningful "how far along the forward timeline" for those, so this renders nothing for them.
 */
export function OrderShippingTimeline({ order }: OrderShippingTimelineProps): React.JSX.Element | null {
  const t = useTranslations('order');
  const currentIndex = ORDER_TIMELINE_STEPS.findIndex((step) => step === order.status);

  if (currentIndex === -1) return null;

  return (
    <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3">
      <h2 className="text-foreground text-sm font-semibold">{t('shippingActivity.title')}</h2>
      <ol className="space-y-4">
        {ORDER_TIMELINE_STEPS.map((step, index) => {
          const isDone = index <= currentIndex;
          return (
            <li key={step} className="flex items-start gap-3">
              <span
                className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full ${
                  isDone ? 'bg-success-50 text-success-700' : 'bg-muted text-muted-foreground'
                }`}
              >
                {isDone ? <Check className="size-3" /> : null}
              </span>
              <div>
                <p className={`text-sm font-medium ${isDone ? 'text-foreground' : 'text-muted-foreground'}`}>{t(`statusLabels.${step}`)}</p>
                <p className="text-muted-foreground text-xs">{t(`shippingActivity.description.${step}`)}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
