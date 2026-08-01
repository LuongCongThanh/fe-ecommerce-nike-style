import { homeCategoriesData } from '@/app/[locale]/(shop)/_lib/data/home';
import type { HomeCategory } from '@/app/[locale]/(shop)/_lib/types/home';

export function getCategoryBySlug(slug: string): HomeCategory | null {
  return homeCategoriesData.find((c) => c.slug === slug) ?? null;
}
