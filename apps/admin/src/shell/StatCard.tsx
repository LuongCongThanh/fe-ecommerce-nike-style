import type { LucideIcon } from 'lucide-react';

import { Skeleton } from '@repo/ui/skeleton';

interface StatCardProps {
  readonly label: string;
  readonly value: number | undefined;
  readonly icon: LucideIcon;
  readonly isLoading: boolean;
}

/** One real-data stat tile — no invented numbers. `value` is `undefined` while its query is still
 * loading (shown as a skeleton) so a card never briefly flashes 0 before the real count arrives. */
export function StatCard({ label, value, icon: Icon, isLoading }: StatCardProps): React.JSX.Element {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3">
      <div className="bg-accent text-accent-foreground flex size-12 shrink-0 items-center justify-center rounded-xl">
        <Icon className="size-6" />
      </div>
      <div className="min-w-0">
        <p className="text-muted-foreground truncate text-xs">{label}</p>
        {isLoading || value === undefined ? (
          <Skeleton className="mt-1 h-6 w-12" />
        ) : (
          <p className="text-foreground text-xl font-bold tracking-tight">{value.toLocaleString()}</p>
        )}
      </div>
    </div>
  );
}
