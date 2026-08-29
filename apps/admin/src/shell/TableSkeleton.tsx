import { Skeleton } from '@repo/ui/skeleton';
import { TableCell, TableRow } from '@repo/ui/table';

interface TableSkeletonProps {
  readonly columns: number;
  readonly rows?: number;
}

/** Placeholder rows shown while a list query is loading — replaces the plain "Đang tải..." text
 * every list page used to show (UI/UX audit finding #5: no loading feedback beyond text). */
export function TableSkeleton({ columns, rows = 5 }: TableSkeletonProps): React.JSX.Element {
  return (
    <>
      {Array.from({ length: rows }, (_, rowIndex) => (
        <TableRow key={rowIndex}>
          {Array.from({ length: columns }, (_, colIndex) => (
            <TableCell key={colIndex}>
              <Skeleton className="h-4 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}
