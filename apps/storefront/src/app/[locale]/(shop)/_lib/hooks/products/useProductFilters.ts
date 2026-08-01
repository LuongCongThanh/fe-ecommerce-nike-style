import { useState } from 'react';

import { APP_CONFIG } from '@/shared/constants/app-config';
import { buildQueryString } from '@/shared/lib/utils';
import { type ProductFilter } from '@/shared/types/filter';

const DEFAULT_FILTERS: ProductFilter = {
  page: 1,
  pageSize: APP_CONFIG.ITEMS_PER_PAGE,
};

export function useProductFilters(initial?: Partial<ProductFilter>) {
  const [filters, setFilters] = useState<ProductFilter>({ ...DEFAULT_FILTERS, ...initial });

  function setFilter<K extends keyof ProductFilter>(key: K, value: ProductFilter[K]) {
    setFilters((previous) => ({
      ...previous,
      [key]: value,
      ...(key !== 'page' ? { page: 1 } : {}),
    }));
  }

  function resetFilters() {
    setFilters(DEFAULT_FILTERS);
  }

  function toQueryString(): string {
    return buildQueryString(filters);
  }

  return {
    filters,
    setFilter,
    resetFilters,
    toQueryString,
  };
}
