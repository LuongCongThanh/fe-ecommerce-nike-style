'use client';

import { useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import type { Gender } from '@repo/schemas/catalog';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { useLocale } from 'next-intl';
import type { SyntheticEvent } from 'react';

import { CategoryNav } from '@/app/[locale]/(shop)/_lib/components/categories/CategoryNav';
import { useCategoryTree } from '@/app/[locale]/(shop)/_lib/hooks/categories/useCategoryTree';
import { clearCatalogFilters, parseCatalogFilters, withCatalogFilter } from '@/app/[locale]/(shop)/_lib/utils/catalogUrlState';

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const { data: categories } = useCategoryTree();
  const [isPending, startTransition] = useTransition();

  const filters = parseCatalogFilters(searchParams);

  const applyFilter = (key: 'gender' | 'sortBy' | 'minPrice' | 'maxPrice', value: string | undefined) => {
    startTransition(() => {
      router.push(`?${withCatalogFilter(searchParams, key, value).toString()}`);
    });
  };

  const handlePriceSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const next = withCatalogFilter(
      withCatalogFilter(searchParams, 'minPrice', formData.get('minPrice') as string),
      'maxPrice',
      formData.get('maxPrice') as string,
    );
    startTransition(() => {
      router.push(`?${next.toString()}`);
    });
  };

  return (
    <aside className="space-y-8">
      {categories !== undefined && categories.length > 0 ? (
        <CategoryNav categories={categories} locale={locale} activeSlug={activeCategorySlug} />
      ) : null}

      {/* Gender */}
      <div className="space-y-3">
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

      {/* Sorting */}
      <div className="space-y-3">
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
      <div className="space-y-3">
        <h3 className="text-muted-foreground text-sm font-bold tracking-wider uppercase">Khoảng giá (VNĐ)</h3>
        <form onSubmit={handlePriceSubmit} className="space-y-3">
          <div className="flex items-center gap-2">
            <Input name="minPrice" type="number" placeholder="Từ" defaultValue={filters.minPrice ?? ''} className="h-10" aria-label="Giá từ" />
            <span className="text-muted-foreground">-</span>
            <Input name="maxPrice" type="number" placeholder="Đến" defaultValue={filters.maxPrice ?? ''} className="h-10" aria-label="Giá đến" />
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
        className="text-muted-foreground hover:text-foreground w-full"
        disabled={isPending}
        onClick={() => {
          startTransition(() => {
            router.push(`?${clearCatalogFilters(searchParams).toString()}`);
          });
        }}
      >
        Xóa tất cả bộ lọc
      </Button>
    </aside>
  );
}
