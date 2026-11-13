import type { CategoryEntry, CategoryNode } from '@/lib/api/models/catalog';

/** Flattens the API Category tree depth-first so pages can look a Category up by slug or id. */
export function flattenCategories(tree: readonly CategoryNode[], parentId: string | null = null): CategoryEntry[] {
  return tree.flatMap((node) => [{ id: node.id, slug: node.slug, name: node.name, parentId }, ...flattenCategories(node.children, node.id)]);
}
