import type { CategoryEntry, CategoryNode } from '@/integrations/backend/models/catalog';

/** Flattens the API Category tree depth-first so pages can look a Category up by slug or id. */
export function flattenCategories(tree: readonly CategoryNode[], parentId: string | null = null): CategoryEntry[] {
  return tree.flatMap((node) => [{ id: node.id, slug: node.slug, name: node.name, parentId }, ...flattenCategories(node.children, node.id)]);
}

/**
 * Returns the ancestor chain from the root down to the Category with `slug` (inclusive).
 * Returns an empty list for an unknown slug; stops at a missing parent or a `parentId` cycle.
 */
export function getCategoryTrail(flat: readonly CategoryEntry[], slug: string): CategoryEntry[] {
  const target = flat.find((category) => category.slug === slug);
  if (target === undefined) {
    return [];
  }

  const byId = new Map(flat.map((category) => [category.id, category]));
  const visitedIds = new Set<string>([target.id]);
  const leafToRoot: CategoryEntry[] = [target];

  let parentId = target.parentId;
  while (parentId !== null && !visitedIds.has(parentId)) {
    const parent = byId.get(parentId);
    if (parent === undefined) {
      break;
    }
    visitedIds.add(parent.id);
    leafToRoot.push(parent);
    parentId = parent.parentId;
  }

  return leafToRoot.reverse();
}
