import { Check } from 'lucide-react';

interface TrustBadgeListProps {
  readonly items: string[];
}

export function TrustBadgeList({ items }: TrustBadgeListProps): React.JSX.Element {
  return (
    <ul className="flex flex-wrap gap-x-6 gap-y-2">
      {items.map((item, index) => (
        <li key={`${String(index)}-${item}`} className="flex items-center gap-1.5">
          <Check className="text-primary size-4 shrink-0" />
          <span className="text-foreground text-sm">{item}</span>
        </li>
      ))}
    </ul>
  );
}
