'use client';

import { useState } from 'react';
import type { SyntheticEvent } from 'react';

import type { InventoryItem } from '@repo/schemas/inventory';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { useTranslations } from 'next-intl';

import { useUpdateInventoryOnHand } from './useInventoryMutations';

interface InventoryOnHandCellProps {
  readonly item: InventoryItem;
}

/** Editable on-hand quantity for one SKU row — owns its own "is this row's edit in flight" state;
 * every write itself goes through `useUpdateInventoryOnHand` (issue #21), never a direct fetch from the UI. */
export function InventoryOnHandCell({ item }: InventoryOnHandCellProps): React.JSX.Element {
  const t = useTranslations('inventory');
  const tCommon = useTranslations('common');
  const [draftOnHand, setDraftOnHand] = useState(String(item.onHand));
  const updateOnHand = useUpdateInventoryOnHand(item.skuId);

  const isDirty = draftOnHand !== String(item.onHand);

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const onHand = Number(draftOnHand);
    if (!Number.isInteger(onHand) || onHand < 0) return;
    updateOnHand.mutate({ onHand });
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <Input
          type="number"
          min={0}
          aria-label={t('onHandInputLabel', { productName: item.productName })}
          value={draftOnHand}
          onChange={(e) => {
            setDraftOnHand(e.target.value);
          }}
          className="w-24"
        />
        <Button type="submit" size="sm" variant="outline" disabled={!isDirty || updateOnHand.isPending}>
          {updateOnHand.isPending ? tCommon('actions.saving') : tCommon('actions.save')}
        </Button>
      </form>
      {updateOnHand.isError ? (
        <p role="alert" className="text-destructive mt-1 text-xs">
          {updateOnHand.error instanceof Error ? updateOnHand.error.message : t('updateError')}
        </p>
      ) : null}
    </div>
  );
}
