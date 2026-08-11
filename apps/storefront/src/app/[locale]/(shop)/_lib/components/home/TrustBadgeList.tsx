import { cn } from '@repo/shared/utils';
import { Check } from 'lucide-react';

interface TrustBadgeListProps {
  readonly items: string[];
  readonly tone?: 'light' | 'dark';
}

export function TrustBadgeList({ items, tone = 'dark' }: TrustBadgeListProps): React.JSX.Element {
  return (
    <ul className="flex flex-wrap gap-x-6 gap-y-2">
      {items.map((item, index) => (
        <li key={`${String(index)}-${item}`} className="flex items-center gap-1.5">
          <span
            className={cn(
              'flex size-5 shrink-0 items-center justify-center rounded-full',
              tone === 'light' ? 'bg-success-50 text-success-700' : 'bg-white/10 text-white',
            )}
          >
            <Check className="size-3.5" />
          </span>
          <span className={cn('text-sm', tone === 'light' ? 'text-muted-foreground' : 'text-white/90')}>{item}</span>
        </li>
      ))}
    </ul>
  );
}
