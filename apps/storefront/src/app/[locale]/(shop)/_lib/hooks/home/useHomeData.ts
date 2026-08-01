'use client';

import { useMemo } from 'react';

import { bestSellersData, homeCategoriesData, newArrivalsData } from '@/app/[locale]/(shop)/_lib/data/home';

export function useHomeData() {
  return useMemo(
    () => ({
      bestSellers: bestSellersData,
      newArrivals: newArrivalsData,
      flashSale: bestSellersData.slice(0, 4),
      categories: homeCategoriesData,
    }),
    [],
  );
}
