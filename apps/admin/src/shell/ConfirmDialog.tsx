import type { ReactNode } from 'react';

import { Button } from '@repo/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@repo/ui/dialog';
import { useTranslation } from 'react-i18next';

interface ConfirmDialogProps {
  readonly trigger: ReactNode;
  readonly title: string;
  readonly description?: string;
  readonly confirmLabel?: string;
  readonly cancelLabel?: string;
  readonly onConfirm: () => void;
  readonly loading?: boolean;
}

/** Admin's counterpart to the storefront's `ConfirmDialog` — same shape, without a `@repo/shared`
 * dependency admin doesn't otherwise have. Exists so a destructive action (e.g. deleting a Product)
 * never fires from a single click, matching the storefront's own guard for destructive actions. */
export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  loading = false,
}: ConfirmDialogProps): React.JSX.Element {
  const { t } = useTranslation('common');

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description != null && description.length > 0 ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              {cancelLabel ?? t('actions.cancel')}
            </Button>
          </DialogClose>
          <Button type="button" onClick={onConfirm} disabled={loading}>
            {loading ? t('actions.processing') : (confirmLabel ?? t('actions.confirm'))}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
