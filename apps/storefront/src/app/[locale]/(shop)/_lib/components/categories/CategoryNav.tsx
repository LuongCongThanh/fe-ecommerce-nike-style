import Link from 'next/link';

import type { Category } from '@repo/schemas/catalog';
import { cn } from '@repo/shared/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@repo/ui/accordion';

interface CategoryNavProps {
  readonly categories: readonly Category[];
  readonly locale: string;
  readonly activeSlug?: string;
}

/**
 * Renders the Decision #95 Category tree (6 top-level: Tops/Bottoms/Shoes/Bags/Accessories/Sale) as
 * a collapsible 2-level nav — every one of the 6 top-level categories is an Accordion section (`type
 *="multiple"` so more than one can stay open), even the ones with no children yet (`Bottoms`/`Bags`/
 * `Sale`), so the sidebar always reads as 6 uniform collapsible rows instead of a mix of accordions
 * and plain links. The section containing `activeSlug` opens by default so landing on a leaf category
 * page doesn't hide its own parent's children behind a collapsed trigger.
 */
export function CategoryNav({ categories, locale, activeSlug }: CategoryNavProps): React.JSX.Element {
  const topLevel = categories.filter((c) => c.parentId === null);
  const defaultOpen = topLevel
    .filter((top) => top.slug === activeSlug || categories.some((c) => c.parentId === top.id && c.slug === activeSlug))
    .map((top) => top.id);

  return (
    <nav aria-label="Product categories">
      <h3 className="text-muted-foreground mb-3 text-sm font-bold tracking-wider uppercase">Categories</h3>
      <Accordion type="multiple" defaultValue={defaultOpen}>
        {topLevel.map((top) => {
          const children = categories.filter((c) => c.parentId === top.id);
          const topLinkClass = cn(
            'text-sm font-semibold transition-colors',
            activeSlug === top.slug ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
          );

          return (
            <AccordionItem key={top.id} value={top.id}>
              <AccordionTrigger className="hover:no-underline">
                <Link
                  href={`/${locale}/categories/${top.slug}`}
                  onClick={(e) => {
                    e.stopPropagation(); // navigate on click without also toggling the accordion section
                  }}
                  className={topLinkClass}
                >
                  {top.name}
                </Link>
              </AccordionTrigger>
              <AccordionContent>
                {children.length > 0 ? (
                  <ul className="ml-3 space-y-1.5 border-l pl-3">
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
                ) : (
                  <p className="text-muted-foreground ml-3 pl-3 text-sm">No sub-categories yet</p>
                )}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </nav>
  );
}
