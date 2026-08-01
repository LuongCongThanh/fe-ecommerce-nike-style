'use client';

import { useMemo } from 'react';

import { productsData } from '@/app/[locale]/(shop)/_lib/data/products';
import type { ProductDisplay } from '@/app/[locale]/(shop)/_lib/types/product';

export type SortBy = 'newest' | 'price_asc' | 'price_desc';

export interface ProductQuery {
  search?: string;
  categorySlug?: string;
  sortBy?: SortBy;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  pageSize?: number;
}

export function useProducts({
  search,
  categorySlug,
  sortBy = 'newest',
  minPrice = 0,
  maxPrice = 10_000_000,
  page = 1,
  pageSize = 12,
}: ProductQuery = {}) {
  return useMemo(() => {
    // Empty string search → no results (search page with no query)
    if (search === '') {
      return { products: [], total: 0, totalPages: 1, currentPage: 1 };
    }

    let filtered: ProductDisplay[] = productsData;

    if (search !== undefined) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }

    if (categorySlug !== undefined && categorySlug !== '' && categorySlug !== 'all') {
      filtered = filtered.filter((p) => p.categorySlug === categorySlug);
    }

    filtered = filtered.filter((p) => {
      const effectivePrice = p.salePrice ?? p.price;
      return effectivePrice >= minPrice && effectivePrice <= maxPrice;
    });

    const sorted = [...filtered].sort((a, b) => {
      const aPrice = a.salePrice ?? a.price;
      const bPrice = b.salePrice ?? b.price;
      if (sortBy === 'price_asc') return aPrice - bPrice;
      if (sortBy === 'price_desc') return bPrice - aPrice;
      return b.id - a.id;
    });

    const total = sorted.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const currentPage = Math.min(Math.max(1, page), totalPages);
    const start = (currentPage - 1) * pageSize;
    const products = sorted.slice(start, start + pageSize);

    return { products, total, totalPages, currentPage };
  }, [search, categorySlug, sortBy, minPrice, maxPrice, page, pageSize]);
}
