import { Button } from './Button';
import { Card, CardContent, CardHeader, CardTitle } from './Card';
import { Skeleton } from './Skeleton';

export interface SummaryListItem {
  readonly id: string;
  readonly label: string;
}

export interface SummaryListCardProps {
  readonly title: string;
  readonly reloadLabel: string;
  readonly onReload: () => void;
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly errorMessage: string;
  readonly emptyMessage: string;
  readonly items: readonly SummaryListItem[];
}

export function SummaryListCard({
  title,
  reloadLabel,
  onReload,
  isLoading,
  isError,
  errorMessage,
  emptyMessage,
  items,
}: SummaryListCardProps): React.JSX.Element {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <Button size="sm" variant="outline" onClick={onReload}>
          {reloadLabel}
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-4/5" />
            <Skeleton className="h-5 w-3/5" />
          </div>
        ) : null}

        {isError ? (
          <p className="text-destructive text-sm" role="alert">
            {errorMessage}
          </p>
        ) : null}

        {!isLoading && !isError && items.length === 0 ? <p className="text-muted-foreground text-sm">{emptyMessage}</p> : null}

        {items.length > 0 ? (
          <ul className="divide-border divide-y">
            {items.map((item) => (
              <li key={item.id} className="text-foreground py-2 text-sm">
                {item.label}
              </li>
            ))}
          </ul>
        ) : null}
      </CardContent>
    </Card>
  );
}
