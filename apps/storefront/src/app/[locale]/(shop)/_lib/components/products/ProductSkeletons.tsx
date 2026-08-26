// Hallmark redesign · design-system: design.md · scope: app page (functional, no enrichment)
// Apple Design pass · §1 Response — a skeleton shaped like the real layout, so first paint never
// jumps. A centred spinner tells the user "wait"; a skeleton tells them what is arriving and where.
import { Skeleton } from '@repo/ui/skeleton';

const GRID_PLACEHOLDER_COUNT = 12;

/** PLP / related-products grid placeholder — same columns and card proportions as `CatalogProductGrid`. */
export function CatalogGridSkeleton({ count = GRID_PLACEHOLDER_COUNT }: { readonly count?: number }): React.JSX.Element {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={`product-skeleton-${i.toString()}`} className="bg-card overflow-hidden rounded-xl border shadow-sm">
          <Skeleton className="aspect-[4/5] w-full rounded-none" />
          <div className="flex flex-col gap-2 p-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="mt-1 h-5 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** PDP placeholder — mirrors the gallery / info-panel two-column split so the real content lands in place. */
export function ProductDetailSkeleton(): React.JSX.Element {
  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16" aria-hidden="true">
      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="flex gap-3 lg:order-first lg:flex-col">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={`thumb-skeleton-${i.toString()}`} className="size-20 shrink-0 rounded-lg" />
          ))}
        </div>
        <Skeleton className="aspect-[4/5] w-full rounded-xl lg:flex-1" />
      </div>

      <div className="flex flex-col gap-6">
        <div className="space-y-3">
          <Skeleton className="h-9 w-4/5" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="aspect-square w-full rounded-xl" />
        <Skeleton className="h-9 w-48" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-24" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={`variant-skeleton-${i.toString()}`} className="h-11 w-16 rounded-full" />
            ))}
          </div>
        </div>
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    </div>
  );
}
