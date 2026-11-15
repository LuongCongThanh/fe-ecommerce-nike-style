// Hallmark redesign · design-system: design.md · scope: app page (functional, no enrichment)
import Link from 'next/link';

import { useTranslations } from 'next-intl';

import type { CategoryNode } from '@/lib/api/models/catalog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/shared/ui/Accordion';
import { cn } from '@/shared/utils/utils';

interface CategoryNavProps {
  readonly categories: readonly CategoryNode[];
  readonly locale: string;
  readonly activeSlug?: string;
}

/**
 * The API Category tree as a collapsible 2-level nav. Every root is an Accordion section (`type
 * ="multiple"`), even ones without children, so the sidebar reads as uniform rows. The section that
 * contains `activeSlug` opens by default so a child page does not hide its own siblings.
 */
export function CategoryNav({ categories, locale, activeSlug }: CategoryNavProps): React.JSX.Element {
  const t = useTranslations('product');
  const topLevel = categories;
  const defaultOpen = topLevel.filter((top) => top.slug === activeSlug || top.children.some((c) => c.slug === activeSlug)).map((top) => top.id);

  return (
    <nav aria-label={t('categories')} className="space-y-3">
      <h3 className="text-muted-foreground text-[11px] font-bold tracking-[0.16em] uppercase">{t('categories')}</h3>
      <Accordion type="multiple" defaultValue={defaultOpen}>
        {topLevel.map((top) => {
          const children = top.children;
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
                  className={cn(
                    topLinkClass,
                    'focus-visible:ring-ring rounded-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
                  )}
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
                            'focus-visible:ring-ring block rounded-sm py-0.5 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
                            activeSlug === child.slug ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground',
                          )}
                        >
                          {child.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground ml-3 pl-3 text-sm">{t('noSubcategories')}</p>
                )}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </nav>
  );
}
