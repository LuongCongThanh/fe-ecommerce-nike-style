'use client';

import { useState } from 'react';
import type { SyntheticEvent } from 'react';

import type { InventoryItem } from '@repo/schemas/inventory';
import { Badge } from '@repo/ui/badge';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { TableCell, TableRow } from '@repo/ui/table';

import { useUpdateInventoryOnHand } from './useInventoryMutations';

interface InventoryRowProps {
  readonly item: InventoryItem;
}

/** One editable SKU row — owns its own "is this row's on_hand edit in flight" state; every write
 * itself goes through `useUpdateInventoryOnHand` (issue #21), never a direct fetch from the UI. */
export function InventoryRow({ item }: InventoryRowProps): React.JSX.Element {
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
    <TableRow>
      <TableCell className="font-medium">{item.productName}</TableCell>
      <TableCell>
        {item.color !== null || item.size !== null ? (
          <Badge variant="outline">{[item.color, item.size].filter(Boolean).join(' / ')}</Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell>
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            aria-label={`Tồn kho thực tế cho ${item.productName}`}
            value={draftOnHand}
            onChange={(e) => {
              setDraftOnHand(e.target.value);
            }}
            className="w-24"
          />
          <Button type="submit" size="sm" variant="outline" disabled={!isDirty || updateOnHand.isPending}>
            {updateOnHand.isPending ? '...' : 'Lưu'}
          </Button>
        </form>
        {updateOnHand.isError ? (
          <p role="alert" className="text-destructive mt-1 text-xs">
            {updateOnHand.error instanceof Error ? updateOnHand.error.message : 'Không thể cập nhật tồn kho.'}
          </p>
        ) : null}
      </TableCell>
      <TableCell>{item.reserved}</TableCell>
      <TableCell className="font-medium">{item.available}</TableCell>
    </TableRow>
  );
}
