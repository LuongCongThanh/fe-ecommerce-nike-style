'use client';

import { useRouter, useSearchParams } from 'next/navigation';

import type { SyntheticEvent } from 'react';

import type { SortBy } from '@/app/[locale]/(shop)/_lib/hooks/products/useProducts';
import { Button } from '@/shared/components/base/button';
import { Input } from '@/shared/components/base/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/base/select';

export function FilterSidebar(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();

  const sortByParam = searchParams.get('sortBy');
  const currentSort = (sortByParam as SortBy | null) !== null ? (sortByParam as SortBy) : 'newest';
  const currentMinPrice = searchParams.get('minPrice') ?? '';
  const currentMaxPrice = searchParams.get('maxPrice') ?? '';

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value !== '') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Reset to page 1 when filter changes
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  const handlePriceSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    updateFilters('minPrice', formData.get('minPrice') as string);
    updateFilters('maxPrice', formData.get('maxPrice') as string);
  };

  return (
    <aside className="space-y-8">
      {/* Sorting */}
      <div className="space-y-3">
        <h3 className="text-muted-foreground text-sm font-bold tracking-wider uppercase">Sắp xếp theo</h3>
        <Select
          value={currentSort}
          onValueChange={(val) => {
            updateFilters('sortBy', val);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Chọn kiểu sắp xếp" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Mới nhất</SelectItem>
            <SelectItem value="price_asc">Giá tăng dần</SelectItem>
            <SelectItem value="price_desc">Giá giảm dần</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Price Filter */}
      <div className="space-y-3">
        <h3 className="text-muted-foreground text-sm font-bold tracking-wider uppercase">Khoảng giá (VNĐ)</h3>
        <form onSubmit={handlePriceSubmit} className="space-y-3">
          <div className="flex items-center gap-2">
            <Input name="minPrice" type="number" placeholder="Từ" defaultValue={currentMinPrice} className="h-9" />
            <span className="text-muted-foreground">-</span>
            <Input name="maxPrice" type="number" placeholder="Đến" defaultValue={currentMaxPrice} className="h-9" />
          </div>
          <Button type="submit" size="sm" className="w-full">
            Áp dụng
          </Button>
        </form>
      </div>

      {/* Clear Filters */}
      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground hover:text-foreground w-full"
        onClick={() => {
          router.push(window.location.pathname);
        }}
      >
        Xóa tất cả bộ lọc
      </Button>
    </aside>
  );
}
