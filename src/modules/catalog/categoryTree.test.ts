import { describe, expect, it } from 'vitest';

import { flattenCategories, getCategoryTrail } from '@/modules/catalog/categoryTree';
import type { CategoryEntry, CategoryNode } from '@/lib/api/models/catalog';

function node(id: string, slug: string, children: readonly CategoryNode[] = []): CategoryNode {
  return { id, slug, name: slug, children };
}

function entry(id: string, slug: string, parentId: string | null): CategoryEntry {
  return { id, slug, name: slug, parentId };
}

const TREE: readonly CategoryNode[] = [
  node('1', 'men', [node('1.1', 'men-shoes', [node('1.1.1', 'men-running')]), node('1.2', 'men-clothing')]),
  node('2', 'women'),
];

describe('flattenCategories', () => {
  it('lists nested categories depth-first', () => {
    const flat = flattenCategories(TREE);

    expect(flat.map((category) => category.slug)).toEqual(['men', 'men-shoes', 'men-running', 'men-clothing', 'women']);
  });

  it('sets a null parentId on roots and the parent id on children', () => {
    const flat = flattenCategories(TREE);

    expect(flat.map((category) => [category.id, category.parentId])).toEqual([
      ['1', null],
      ['1.1', '1'],
      ['1.1.1', '1.1'],
      ['1.2', '1'],
      ['2', null],
    ]);
  });
});

describe('getCategoryTrail', () => {
  const flat = flattenCategories(TREE);

  it.each([
    { slug: 'women', expected: ['women'] },
    { slug: 'men-shoes', expected: ['men', 'men-shoes'] },
    { slug: 'men-running', expected: ['men', 'men-shoes', 'men-running'] },
  ])('returns the chain from root to $slug', ({ slug, expected }) => {
    expect(getCategoryTrail(flat, slug).map((category) => category.slug)).toEqual(expected);
  });

  it('returns an empty trail for an unknown slug', () => {
    expect(getCategoryTrail(flat, 'kids')).toEqual([]);
  });

  it('stops at a category whose parent is missing', () => {
    const orphanData = [entry('a', 'orphan', 'missing')];

    expect(getCategoryTrail(orphanData, 'orphan')).toEqual(orphanData);
  });

  it('returns a finite trail when parentIds form a cycle', () => {
    const cyclicData = [entry('a', 'alpha', 'b'), entry('b', 'beta', 'a')];

    const trail = getCategoryTrail(cyclicData, 'alpha');

    expect(trail.map((category) => category.slug)).toEqual(['beta', 'alpha']);
  });

  it('does not mutate the input list', () => {
    const snapshot = [...flat];

    getCategoryTrail(flat, 'men-running');

    expect(flat).toEqual(snapshot);
  });
});
