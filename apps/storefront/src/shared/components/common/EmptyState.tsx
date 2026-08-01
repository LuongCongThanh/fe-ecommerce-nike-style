import type { LucideIcon } from 'lucide-react';
import { PackageOpen } from 'lucide-react';

import { Button } from '@/shared/components/base/button';
import { cn } from '@/shared/lib/utils';

interface EmptyStateProps {
  readonly title: string;
  readonly description?: string;
  readonly icon?: LucideIcon;
  readonly actionLabel?: string;
  readonly onAction?: () => void;
  readonly className?: string;
}

export function EmptyState({ title, description, icon: Icon = PackageOpen, actionLabel, onAction, className }: EmptyStateProps): React.JSX.Element {
  return (
    <div className={cn('flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-12 text-center', className)}>
      <div className="bg-muted mb-4 rounded-full p-4">
        <Icon className="text-muted-foreground size-6" />
      </div>
      <h3 className="text-foreground text-lg font-semibold">{title}</h3>
      {description != null && description.length > 0 ? <p className="text-muted-foreground mt-2 max-w-md text-sm">{description}</p> : null}
      {actionLabel != null && actionLabel.length > 0 && onAction != null ? (
        <Button className="mt-5" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
