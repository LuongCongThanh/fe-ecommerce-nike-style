'use client';

import { useQuery } from '@tanstack/react-query';

import { productActions } from '@/app/[locale]/(shop)/_lib/api/product';

const productKeys = {
  all: ['products'] as const,
  categories: () => [...productKeys.all, 'categories'] as const,
};

export const useCategories = () =>
  useQuery({
    queryKey: productKeys.categories(),
    queryFn: productActions.categories,
    staleTime: 10 * 60_000,
  });
