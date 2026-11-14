// Hallmark redesign · design-system: design.md · scope: app page (functional, no enrichment)
'use client';

import { useLocale, useTranslations } from 'next-intl';

import type { Gender } from '@/features/catalog/catalogUrlState';
import { CategoryNav } from '@/features/catalog/components/CategoryNav';
import { useCatalogFilterControls } from '@/features/catalog/hooks/useCatalogFilterControls';
import { useCatalogOptions } from '@/features/catalog/queries/useCatalogOptions';
import { useCategoryTree } from '@/features/catalog/queries/useCategoryTree';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/Select';
import { cn } from '@/shared/utils/utils';

interface FilterSidebarProps {
  /** Highlights the current node in the Category tree — only set on `/categories/[slug]`. */
  readonly activeCategorySlug?: string;
}

export function FilterSidebar({ activeCategorySlug }: FilterSidebarProps = {}): React.JSX.Element {
  const locale = useLocale();
  const t = useTranslations('product');
  const { data: categories } = useCategoryTree();
  const { sizes, colors } = useCatalogOptions();
  const { filters, options, applyFilter, toggleOption, submitPriceRange, clearFilters, isPending } = useCatalogFilterControls();

  return (
    <aside className="space-y-7 px-4 py-6 sm:px-6 lg:px-5">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-xl font-semibold tracking-tight">{t('filterTitle')}</h2>
        <span className="text-muted-foreground text-xs tracking-[0.14em] uppercase">{t('curate')}</span>
      </div>
      {categories !== undefined && categories.tree.length > 0 ? (
        <CategoryNav categories={categories.tree} locale={locale} activeSlug={activeCategorySlug} />
      ) : null}

      {/* Gender */}
      <div className="space-y-3 border-t pt-6 first:border-t-0 first:pt-0">
        <h3 className="text-muted-foreground text-[11px] font-bold tracking-[0.16em] uppercase">{t('gender')}</h3>
        <Select
          value={filters.gender ?? 'all'}
          onValueChange={(val) => {
            applyFilter('gender', val === 'all' ? undefined : val);
          }}
        >
          <SelectTrigger className="w-full" aria-label={t('gender')}>
            <SelectValue placeholder={t('allGenders')} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">{t('allGenders')}</SelectItem>
              {(['men', 'women', 'kids', 'unisex'] as const satisfies readonly Gender[]).map((value) => (
                <SelectItem key={value} value={value}>
                  {t(`genderOptions.${value}`)}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Size — several may be picked; a Product matches when one active Variant has any of them. */}
      {sizes.length > 0 ? (
        <div className="space-y-3 border-t pt-6">
          <h3 className="text-muted-foreground text-[11px] font-bold tracking-[0.16em] uppercase">{t('size')}</h3>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const isOn = options.size.includes(size.code);
              return (
                <button
                  key={size.id}
                  type="button"
                  aria-pressed={isOn}
                  disabled={isPending}
                  onClick={() => {
                    toggleOption('size', size.code);
                  }}
                  className={cn(
                    'focus-visible:ring-ring min-h-10 min-w-11 rounded-full border px-3 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
                    isOn ? 'border-foreground bg-foreground text-background' : 'hover:border-foreground',
                  )}
                >
                  {size.name}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Color */}
      {colors.length > 0 ? (
        <div className="space-y-3 border-t pt-6">
          <h3 className="text-muted-foreground text-[11px] font-bold tracking-[0.16em] uppercase">{t('color')}</h3>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => {
              const isOn = options.color.includes(color.code);
              return (
                <button
                  key={color.id}
                  type="button"
                  aria-pressed={isOn}
                  aria-label={color.name}
                  title={color.name}
                  disabled={isPending}
                  onClick={() => {
                    toggleOption('color', color.code);
                  }}
                  className={cn(
                    'focus-visible:ring-ring flex size-10 items-center justify-center rounded-full border-2 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
                    isOn ? 'border-foreground' : 'hover:border-foreground/50 border-transparent',
                  )}
                >
                  <span className="size-7 rounded-full border border-black/10" style={{ backgroundColor: color.hex }} />
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Sorting */}
      <div className="space-y-3 border-t pt-6">
        <h3 className="text-muted-foreground text-[11px] font-bold tracking-[0.16em] uppercase">{t('sortBy')}</h3>
        <Select
          value={filters.sortBy}
          onValueChange={(val) => {
            applyFilter('sortBy', val);
          }}
        >
          <SelectTrigger className="w-full" aria-label={t('sortBy')}>
            <SelectValue placeholder={t('sortNewest')} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="newest">{t('sortNewest')}</SelectItem>
              <SelectItem value="price_asc">{t('sortPriceAscending')}</SelectItem>
              <SelectItem value="price_desc">{t('sortPriceDescending')}</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Price Filter */}
      <div className="space-y-3 border-t pt-6">
        <h3 className="text-muted-foreground text-[11px] font-bold tracking-[0.16em] uppercase">{t('priceRange')}</h3>
        <form onSubmit={submitPriceRange} className="space-y-3">
          <div className="flex items-center gap-2">
            <Input
              name="minPrice"
              type="number"
              placeholder={t('minPrice')}
              defaultValue={filters.minPrice ?? ''}
              className="h-11"
              aria-label={t('minPrice')}
            />
            <span className="text-muted-foreground">-</span>
            <Input
              name="maxPrice"
              type="number"
              placeholder={t('maxPrice')}
              defaultValue={filters.maxPrice ?? ''}
              className="h-11"
              aria-label={t('maxPrice')}
            />
          </div>
          <Button type="submit" size="md" className="w-full" disabled={isPending} aria-busy={isPending}>
            {isPending ? t('applyingFilters') : t('applyFilters')}
          </Button>
          <span role="status" aria-live="polite" className="sr-only">
            {isPending ? t('applyingFiltersStatus') : ''}
          </span>
        </form>
      </div>

      {/* Clear Filters */}
      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground hover:text-foreground w-full border-t pt-5"
        disabled={isPending}
        onClick={clearFilters}
      >
        {t('clearFilters')}
      </Button>
    </aside>
  );
}
