import { Checkbox } from '@repo/ui/checkbox';
import type { ColumnDef } from '@tanstack/react-table';

export interface SelectColumnOptions<T> {
  /** Accessible label for the header's select-all checkbox, given how many rows are selected. */
  readonly selectAllLabel?: (selectedCount: number) => string;
  /** Accessible label for one row's checkbox — typically the row's name. */
  readonly rowLabel?: (row: T) => string;
}

/**
 * The leading select-all/select-row checkbox column, identical on every list page that supports bulk
 * actions (products, tasks, staff). Only the accessible labels differed, so those are the options.
 */
export function selectColumn<T>(options: SelectColumnOptions<T> = {}): ColumnDef<T> {
  const { selectAllLabel, rowLabel } = options;

  return {
    id: 'select',
    meta: { className: 'w-10' },
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllRowsSelected()}
        onCheckedChange={(checked) => {
          table.toggleAllRowsSelected(checked === true);
        }}
        aria-label={selectAllLabel?.(table.getSelectedRowModel().rows.length)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(checked) => {
          row.toggleSelected(checked === true);
        }}
        aria-label={rowLabel?.(row.original)}
      />
    ),
  };
}
