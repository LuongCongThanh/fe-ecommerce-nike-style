// Hallmark redesign · design-system: design.md · scope: app page (functional, no enrichment)
'use client';

import { useLocale } from 'next-intl';

import { CategoryNav } from '@/app/[locale]/(shop)/_lib/components/categories/CategoryNav';
import { useCatalogFilterControls } from '@/app/[locale]/(shop)/_lib/hooks/categories/useCatalogFilterControls';
import { useCatalogOptions } from '@/app/[locale]/(shop)/_lib/hooks/categories/useCatalogOptions';
import { useCategoryTree } from '@/app/[locale]/(shop)/_lib/hooks/categories/useCategoryTree';
import type { Gender } from '@/app/[locale]/(shop)/_lib/utils/catalogUrlState';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { cn } from '@/shared/lib/utils';

const GENDER_LABELS: Record<Gender, string> = {
  men: 'Nam',
  women: 'Nữ',
  kids: 'Trẻ em',
  unisex: 'Unisex',
};

interface FilterSidebarProps {
  /** Highlights the current node in the Category tree — only set on `/categories/[slug]`. */
  readonly activeCategorySlug?: string;
}

export function FilterSidebar({ activeCategorySlug }: FilterSidebarProps = {}): React.JSX.Element {
  const locale = useLocale();
  const { data: categories } = useCategoryTree();
  const { sizes, colors } = useCatalogOptions();
  const { filters, options, applyFilter, toggleOption, submitPriceRange, clearFilters, isPending } = useCatalogFilterControls();

  return (
    // Translucent material rather than an opaque slab: content reads *through* the floating filter
    // panel as it scrolls under, and reduced-transparency users get the solid card back (§12/§14).
    <aside className="bg-card supports-[backdrop-filter]:bg-card/80 space-y-8 rounded-xl border p-5 backdrop-blur-xl backdrop-saturate-150 motion-reduce:backdrop-blur-none">
      {categories !== undefined && categories.tree.length > 0 ? (
        <CategoryNav categories={categories.tree} locale={locale} activeSlug={activeCategorySlug} />
      ) : null}

      {/* Gender */}
      <div className="space-y-3 border-t pt-6 first:border-t-0 first:pt-0">
        <h3 className="text-muted-foreground text-sm font-bold tracking-wider uppercase">Giới tính</h3>
        <Select
          value={filters.gender ?? 'all'}
          onValueChange={(val) => {
            applyFilter('gender', val === 'all' ? undefined : val);
          }}
        >
          <SelectTrigger className="w-full" aria-label="Giới tính">
            <SelectValue placeholder="Tất cả" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">Tất cả</SelectItem>
              {Object.entries(GENDER_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Size — several may be picked; a Product matches when one active Variant has any of them. */}
      {sizes.length > 0 ? (
        <div className="space-y-3 border-t pt-6">
          <h3 className="text-muted-foreground text-sm font-bold tracking-wider uppercase">Kích thước</h3>
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
          <h3 className="text-muted-foreground text-sm font-bold tracking-wider uppercase">Màu sắc</h3>
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
        <h3 className="text-muted-foreground text-sm font-bold tracking-wider uppercase">Sắp xếp theo</h3>
        <Select
          value={filters.sortBy}
          onValueChange={(val) => {
            applyFilter('sortBy', val);
          }}
        >
          <SelectTrigger className="w-full" aria-label="Sắp xếp theo">
            <SelectValue placeholder="Chọn kiểu sắp xếp" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="newest">Mới nhất</SelectItem>
              <SelectItem value="price_asc">Giá tăng dần</SelectItem>
              <SelectItem value="price_desc">Giá giảm dần</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Price Filter */}
      <div className="space-y-3 border-t pt-6">
        <h3 className="text-muted-foreground text-sm font-bold tracking-wider uppercase">Khoảng giá (VNĐ)</h3>
        <form onSubmit={submitPriceRange} className="space-y-3">
          <div className="flex items-center gap-2">
            <Input name="minPrice" type="number" placeholder="Từ" defaultValue={filters.minPrice ?? ''} className="h-11" aria-label="Giá từ" />
            <span className="text-muted-foreground">-</span>
            <Input name="maxPrice" type="number" placeholder="Đến" defaultValue={filters.maxPrice ?? ''} className="h-11" aria-label="Giá đến" />
          </div>
          <Button type="submit" size="md" className="w-full" disabled={isPending} aria-busy={isPending}>
            {isPending ? 'Đang áp dụng...' : 'Áp dụng'}
          </Button>
          <span role="status" aria-live="polite" className="sr-only">
            {isPending ? 'Đang áp dụng bộ lọc...' : ''}
          </span>
        </form>
      </div>

      {/* Clear Filters */}
      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground hover:text-foreground w-full border-t pt-6"
        disabled={isPending}
        onClick={clearFilters}
      >
        Xóa tất cả bộ lọc
      </Button>
    </aside>
  );
}
