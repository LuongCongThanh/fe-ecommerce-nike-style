import type { Category, Gender, Product } from '@repo/schemas/catalog';

/**
 * Mock catalog per Decision #50 (decision-log.md): 3 top-level Categories (`Shoes`/`Apparel`/`Accessories`)
 * x 2 children each, ~24 Products spread evenly across the 6 leaf Categories, mixed Variant / no-Variant
 * Products, all 4 Gender values represented. Placeholder content/images only — no real Nike data.
 */

export const mockCategories: Category[] = [
  { id: 'cat-shoes', slug: 'shoes', name: 'Shoes', parentId: null },
  { id: 'cat-running', slug: 'running', name: 'Running', parentId: 'cat-shoes' },
  { id: 'cat-basketball', slug: 'basketball', name: 'Basketball', parentId: 'cat-shoes' },
  { id: 'cat-apparel', slug: 'apparel', name: 'Apparel', parentId: null },
  { id: 'cat-tshirts', slug: 't-shirts', name: 'T-Shirts', parentId: 'cat-apparel' },
  { id: 'cat-hoodies', slug: 'hoodies', name: 'Hoodies', parentId: 'cat-apparel' },
  { id: 'cat-accessories', slug: 'accessories', name: 'Accessories', parentId: null },
  { id: 'cat-bags', slug: 'bags', name: 'Bags', parentId: 'cat-accessories' },
  { id: 'cat-hats', slug: 'hats', name: 'Hats', parentId: 'cat-accessories' },
];

function placeholderImages(seed: string, count = 2): string[] {
  // `.png` — placehold.co defaults to SVG, which Next.js `next/image` blocks by default (no `dangerouslyAllowSVG`).
  return Array.from({ length: count }, (_, i) => `https://placehold.co/800x800.png?text=${encodeURIComponent(seed)}+${String(i + 1)}`);
}

/** Single hidden SKU — Product has no Variant (glossary.md — SKU). */
function singleSku(id: string, price: number): Product['skus'] {
  return [{ id, price, color: null, size: null }];
}

/** Multiple SKUs across a Color x Size Variant tuple, optionally diverging in price to exercise "price from". */
function variantSkus(idPrefix: string, basePrice: number, colors: string[], sizes: string[], priceStep = 0): Product['skus'] {
  const skus: Product['skus'] = [];
  colors.forEach((color, colorIndex) => {
    sizes.forEach((size, sizeIndex) => {
      skus.push({
        id: `${idPrefix}-${String(colorIndex)}-${String(sizeIndex)}`,
        price: basePrice + sizeIndex * priceStep,
        color,
        size,
      });
    });
  });
  return skus;
}

interface ProductSeed {
  id: string;
  slug: string;
  name: string;
  categoryId: string;
  gender: Gender;
  skus: Product['skus'];
}

const productSeeds: ProductSeed[] = [
  // Running (cat-running)
  {
    id: 'p-1',
    slug: 'running-shoe-alpha',
    name: 'Running Shoe Alpha',
    categoryId: 'cat-running',
    gender: 'men',
    skus: variantSkus('p-1', 1_200_000, ['black', 'white'], ['39', '40', '41', '42']),
  },
  {
    id: 'p-2',
    slug: 'running-shoe-bolt',
    name: 'Running Shoe Bolt',
    categoryId: 'cat-running',
    gender: 'women',
    skus: variantSkus('p-2', 1_100_000, ['pink', 'grey'], ['36', '37', '38']),
  },
  {
    id: 'p-3',
    slug: 'running-shoe-dash-kids',
    name: 'Running Shoe Dash Kids',
    categoryId: 'cat-running',
    gender: 'kids',
    skus: singleSku('p-3-sku', 650_000),
  },
  {
    id: 'p-4',
    slug: 'running-shoe-trail',
    name: 'Running Shoe Trail',
    categoryId: 'cat-running',
    gender: 'unisex',
    skus: variantSkus('p-4', 1_300_000, ['olive'], ['38', '39', '40', '41', '42'], 50_000),
  },

  // Basketball (cat-basketball)
  {
    id: 'p-5',
    slug: 'basketball-high-top-court',
    name: 'Basketball High-Top Court',
    categoryId: 'cat-basketball',
    gender: 'men',
    skus: variantSkus('p-5', 1_800_000, ['red', 'black'], ['40', '41', '42', '43']),
  },
  {
    id: 'p-6',
    slug: 'basketball-low-top-flex',
    name: 'Basketball Low-Top Flex',
    categoryId: 'cat-basketball',
    gender: 'women',
    skus: variantSkus('p-6', 1_600_000, ['white'], ['36', '37', '38'], 30_000),
  },
  {
    id: 'p-7',
    slug: 'basketball-hoop-kids',
    name: 'Basketball Hoop Kids',
    categoryId: 'cat-basketball',
    gender: 'kids',
    skus: singleSku('p-7-sku', 750_000),
  },
  {
    id: 'p-8',
    slug: 'basketball-street-unisex',
    name: 'Basketball Street Unisex',
    categoryId: 'cat-basketball',
    gender: 'unisex',
    skus: variantSkus('p-8', 1_500_000, ['navy', 'grey'], ['39', '40', '41']),
  },

  // T-Shirts (cat-tshirts)
  {
    id: 'p-9',
    slug: 'tee-classic-crew',
    name: 'Tee Classic Crew',
    categoryId: 'cat-tshirts',
    gender: 'men',
    skus: variantSkus('p-9', 250_000, ['black', 'white', 'grey'], ['s', 'm', 'l', 'xl']),
  },
  {
    id: 'p-10',
    slug: 'tee-graphic-print',
    name: 'Tee Graphic Print',
    categoryId: 'cat-tshirts',
    gender: 'women',
    skus: variantSkus('p-10', 280_000, ['white'], ['s', 'm', 'l'], 40_000),
  },
  { id: 'p-11', slug: 'tee-basic-kids', name: 'Tee Basic Kids', categoryId: 'cat-tshirts', gender: 'kids', skus: singleSku('p-11-sku', 150_000) },
  {
    id: 'p-12',
    slug: 'tee-unisex-oversized',
    name: 'Tee Unisex Oversized',
    categoryId: 'cat-tshirts',
    gender: 'unisex',
    skus: variantSkus('p-12', 300_000, ['sand', 'black'], ['s', 'm', 'l', 'xl']),
  },

  // Hoodies (cat-hoodies)
  {
    id: 'p-13',
    slug: 'hoodie-pullover',
    name: 'Hoodie Pullover',
    categoryId: 'cat-hoodies',
    gender: 'men',
    skus: variantSkus('p-13', 650_000, ['charcoal', 'navy'], ['m', 'l', 'xl']),
  },
  {
    id: 'p-14',
    slug: 'hoodie-zip-up',
    name: 'Hoodie Zip-Up',
    categoryId: 'cat-hoodies',
    gender: 'women',
    skus: variantSkus('p-14', 700_000, ['maroon'], ['s', 'm', 'l'], 25_000),
  },
  {
    id: 'p-15',
    slug: 'hoodie-fleece-kids',
    name: 'Hoodie Fleece Kids',
    categoryId: 'cat-hoodies',
    gender: 'kids',
    skus: singleSku('p-15-sku', 380_000),
  },
  {
    id: 'p-16',
    slug: 'hoodie-essential-unisex',
    name: 'Hoodie Essential Unisex',
    categoryId: 'cat-hoodies',
    gender: 'unisex',
    skus: variantSkus('p-16', 620_000, ['black', 'grey'], ['s', 'm', 'l', 'xl']),
  },

  // Bags (cat-bags)
  {
    id: 'p-17',
    slug: 'backpack-commuter',
    name: 'Backpack Commuter',
    categoryId: 'cat-bags',
    gender: 'unisex',
    skus: singleSku('p-17-sku', 950_000),
  },
  {
    id: 'p-18',
    slug: 'backpack-mini',
    name: 'Backpack Mini',
    categoryId: 'cat-bags',
    gender: 'women',
    skus: variantSkus('p-18', 720_000, ['blush', 'black'], ['one-size']),
  },
  { id: 'p-19', slug: 'duffel-bag-sport', name: 'Duffel Bag Sport', categoryId: 'cat-bags', gender: 'men', skus: singleSku('p-19-sku', 880_000) },
  {
    id: 'p-20',
    slug: 'backpack-mini-kids',
    name: 'Backpack Mini Kids',
    categoryId: 'cat-bags',
    gender: 'kids',
    skus: variantSkus('p-20', 420_000, ['yellow', 'blue'], ['one-size']),
  },

  // Hats (cat-hats)
  { id: 'p-21', slug: 'cap-snapback', name: 'Cap Snapback', categoryId: 'cat-hats', gender: 'men', skus: singleSku('p-21-sku', 220_000) },
  { id: 'p-22', slug: 'cap-bucket', name: 'Cap Bucket', categoryId: 'cat-hats', gender: 'women', skus: singleSku('p-22-sku', 200_000) },
  { id: 'p-23', slug: 'beanie-kids', name: 'Beanie Kids', categoryId: 'cat-hats', gender: 'kids', skus: singleSku('p-23-sku', 130_000) },
  {
    id: 'p-24',
    slug: 'cap-trucker-unisex',
    name: 'Cap Trucker Unisex',
    categoryId: 'cat-hats',
    gender: 'unisex',
    skus: variantSkus('p-24', 240_000, ['red', 'navy', 'black'], ['one-size']),
  },
];

export const mockProducts: Product[] = productSeeds.map((seed) => ({
  id: seed.id,
  slug: seed.slug,
  name: seed.name,
  images: placeholderImages(seed.name),
  categoryId: seed.categoryId,
  gender: seed.gender,
  skus: seed.skus,
}));

/** Resolves a Category slug (top-level or leaf) to itself plus every descendant Category id — used to filter Products by a Category tree node. */
export function resolveCategoryIds(categories: Category[], slug: string): string[] {
  const match = categories.find((c) => c.slug === slug);
  if (match === undefined) return [];

  const ids = [match.id];
  const children = categories.filter((c) => c.parentId === match.id);
  for (const child of children) {
    ids.push(...resolveCategoryIds(categories, child.slug));
  }
  return ids;
}

export function minSkuPrice(product: Product): number {
  return Math.min(...product.skus.map((sku) => sku.price));
}
