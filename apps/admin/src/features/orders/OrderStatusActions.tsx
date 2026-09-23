import { adminTransitionsFrom } from '@repo/api-sdk/endpoints/order-transitions';
import type { Order } from '@repo/schemas/order';
import { Button } from '@repo/ui/button';
import { useTranslation } from 'react-i18next';

import { useApproveOrderReturn, useRejectOrderReturn, useUpdateOrderStatus } from './useOrderMutations';
import { ConfirmDialog } from '@/shell/ConfirmDialog';

interface OrderStatusActionsProps {
  readonly order: Order;
}

/** The status-update buttons — only ever shows transitions `adminTransitionsFrom` says are valid from
 * the order's current status, so an invalid transition can't even be attempted from the UI (issue #22's
 * "UI chặn transition không hợp lệ, không chỉ dựa vào BE"). Return approve/reject is a separate action,
 * shown only while the order is RETURN_REQUESTED. */
export function OrderStatusActions({ order }: OrderStatusActionsProps): React.JSX.Element {
  const { t } = useTranslation('order');
  const { t: tCommon } = useTranslation('common');
  const updateStatus = useUpdateOrderStatus(order.id);
  const approveReturn = useApproveOrderReturn(order.id);
  const rejectReturn = useRejectOrderReturn(order.id);

  const nextStatuses = adminTransitionsFrom(order.status);
  const mutationError = updateStatus.error ?? approveReturn.error ?? rejectReturn.error;

  return (
    <div className="space-y-2">
      {mutationError !== null ? (
        <p role="alert" className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-4 py-3 text-sm">
          {mutationError instanceof Error ? mutationError.message : t('updateError')}
        </p>
      ) : null}

      {order.status === 'RETURN_REQUESTED' ? (
        <div className="flex gap-2">
          <Button
            disabled={approveReturn.isPending}
            onClick={() => {
              approveReturn.mutate();
            }}
          >
            {t('approveReturn')}
          </Button>
          <ConfirmDialog
            trigger={
              <Button variant="outline" disabled={rejectReturn.isPending}>
                {t('rejectReturn')}
              </Button>
            }
            title={t('rejectReturnTitle')}
            description={t('rejectReturnDescription')}
            confirmLabel={t('reject')}
            loading={rejectReturn.isPending}
            onConfirm={() => {
              rejectReturn.mutate();
            }}
          />
        </div>
      ) : null}

      {nextStatuses.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {nextStatuses.map((status) =>
            status === 'CANCELLED' ? (
              <ConfirmDialog
                key={status}
                trigger={
                  <Button variant="outline" className="text-destructive hover:bg-destructive/10" disabled={updateStatus.isPending}>
                    {t('cancelOrder')}
                  </Button>
                }
                title={t('cancelOrderTitle')}
                description={tCommon('confirmIrreversible')}
                confirmLabel={t('cancelOrder')}
                loading={updateStatus.isPending}
                onConfirm={() => {
                  updateStatus.mutate(status);
                }}
              />
            ) : (
              <Button
                key={status}
                disabled={updateStatus.isPending}
                onClick={() => {
                  updateStatus.mutate(status);
                }}
              >
                {t('transitionTo', { status: t(`statusLabels.${status}`) })}
              </Button>
            ),
          )}
        </div>
      ) : null}
    </div>
  );
}
