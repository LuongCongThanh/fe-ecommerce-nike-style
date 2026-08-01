'use client';

import { useMemo } from 'react';

import { homeCategoriesData } from '@/app/[locale]/(shop)/_lib/data/home';

export function useCategoriesData() {
  return useMemo(() => homeCategoriesData, []);
}
