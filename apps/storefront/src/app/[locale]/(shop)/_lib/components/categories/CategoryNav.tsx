import Link from 'next/link';

import type { Category } from '@repo/schemas/catalog';
import { cn } from '@repo/shared/utils';

interface CategoryNavProps {
  readonly categories: readonly Category[];
  readonly locale: string;
  readonly activeSlug?: string;
}

/** Renders the Decision #50 Category tree (Shoes/Apparel/Accessories x 2 children) as a 2-level nav list. */
export function CategoryNav({ categories, locale, activeSlug }: CategoryNavProps): React.JSX.Element {
  const topLevel = categories.filter((c) => c.parentId === null);

  return (
    <nav className="space-y-3" aria-label="Product categories">
      <h3 className="text-muted-foreground text-sm font-bold tracking-wider uppercase">Categories</h3>
      <ul className="space-y-3">
        {topLevel.map((top) => {
          const children = categories.filter((c) => c.parentId === top.id);
          return (
            <li key={top.id}>
              <Link
                href={`/${locale}/categories/${top.slug}`}
                className={cn(
                  'text-sm font-semibold transition-colors',
                  activeSlug === top.slug ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {top.name}
              </Link>
              {children.length > 0 && (
                <ul className="mt-1.5 ml-3 space-y-1.5 border-l pl-3">
                  {children.map((child) => (
                    <li key={child.id}>
                      <Link
                        href={`/${locale}/categories/${child.slug}`}
                        className={cn(
                          'text-sm transition-colors',
                          activeSlug === child.slug ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground',
                        )}
                      >
                        {child.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
