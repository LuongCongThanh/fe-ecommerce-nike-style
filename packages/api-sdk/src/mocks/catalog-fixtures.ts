import type { Category, CategoryInput, Gender, Product, ProductInput } from '@repo/schemas/catalog';

import { isSkuReferencedInAnyOrder } from './order-fixtures';
import { matchesSearchQuery } from './search-match';

/**
 * Mock catalog per Decision #95/#96 (decision-log.md; supersedes Decision #50's 3-top-level shape): 6
 * top-level Categories (`Tops`/`Bottoms`/`Shoes`/`Bags`/`Accessories`/`Sale`), each with every leaf
 * sub-category from the storefront header's `NAV_CATEGORIES` (`data/nav-categories.ts`) — full 1:1
 * slug+name parity, so every header/mega-menu link resolves on the real category page instead of
 * hitting "Category not found". Only the 6 leaves seeded before Decision #96 (`running`/`basketball`
 * under `shoes`, `t-shirts`/`hoodies` under `tops`, `hats` under `accessories`, and `bags` itself)
 * have actual mock Products — every other leaf added by #96 is a valid, empty Category node (no
 * fabricated Product data for sub-categories nobody asked to seed; Simplicity First). ~24 Products
 * spread across those original 6 leaves, mixed Variant / no-Variant Products, all 4 Gender values
 * represented.
 */

export const mockCategories: Category[] = [
  { id: 'cat-tops', slug: 'tops', name: 'Tops', parentId: null },
  { id: 'cat-tshirts', slug: 't-shirts', name: 'T-Shirts', parentId: 'cat-tops' },
  { id: 'cat-shirts', slug: 'shirts', name: 'Shirts', parentId: 'cat-tops' },
  { id: 'cat-jackets', slug: 'jackets', name: 'Jackets', parentId: 'cat-tops' },
  { id: 'cat-hoodies', slug: 'hoodies', name: 'Hoodies & Sweatshirts', parentId: 'cat-tops' },
  { id: 'cat-polos', slug: 'polos', name: 'Polo Shirts', parentId: 'cat-tops' },
  { id: 'cat-tank-tops', slug: 'tank-tops', name: 'Tank Tops', parentId: 'cat-tops' },

  { id: 'cat-bottoms', slug: 'bottoms', name: 'Bottoms', parentId: null },
  { id: 'cat-jeans', slug: 'jeans', name: 'Jeans', parentId: 'cat-bottoms' },
  { id: 'cat-dress-pants', slug: 'dress-pants', name: 'Dress Pants', parentId: 'cat-bottoms' },
  { id: 'cat-shorts', slug: 'shorts', name: 'Shorts', parentId: 'cat-bottoms' },
  { id: 'cat-athletic-pants', slug: 'athletic-pants', name: 'Athletic Pants', parentId: 'cat-bottoms' },
  { id: 'cat-chinos', slug: 'chinos', name: 'Chinos', parentId: 'cat-bottoms' },

  { id: 'cat-shoes', slug: 'shoes', name: 'Shoes', parentId: null },
  { id: 'cat-running', slug: 'running', name: 'Running', parentId: 'cat-shoes' },
  { id: 'cat-basketball', slug: 'basketball', name: 'Basketball', parentId: 'cat-shoes' },
  { id: 'cat-sneakers', slug: 'sneakers', name: 'Sneakers', parentId: 'cat-shoes' },
  { id: 'cat-leather-shoes', slug: 'leather-shoes', name: 'Leather Shoes', parentId: 'cat-shoes' },
  { id: 'cat-sandals', slug: 'sandals', name: 'Sandals & Slides', parentId: 'cat-shoes' },
  { id: 'cat-boots', slug: 'boots', name: 'Boots & Chelsea', parentId: 'cat-shoes' },
  { id: 'cat-loafers', slug: 'loafers', name: 'Loafers', parentId: 'cat-shoes' },

  { id: 'cat-bags', slug: 'bags', name: 'Bags', parentId: null },
  { id: 'cat-backpacks', slug: 'backpacks', name: 'Backpacks', parentId: 'cat-bags' },
  { id: 'cat-tote-bags', slug: 'tote-bags', name: 'Tote Bags', parentId: 'cat-bags' },
  { id: 'cat-crossbody-bags', slug: 'crossbody-bags', name: 'Crossbody Bags', parentId: 'cat-bags' },
  { id: 'cat-handbags', slug: 'handbags', name: 'Handbags', parentId: 'cat-bags' },
  { id: 'cat-clutches', slug: 'clutches', name: 'Clutches', parentId: 'cat-bags' },

  { id: 'cat-accessories', slug: 'accessories', name: 'Accessories', parentId: null },
  { id: 'cat-watches', slug: 'watches', name: 'Watches', parentId: 'cat-accessories' },
  { id: 'cat-hats', slug: 'hats', name: 'Hats & Caps', parentId: 'cat-accessories' },
  { id: 'cat-sunglasses', slug: 'sunglasses', name: 'Sunglasses', parentId: 'cat-accessories' },
  { id: 'cat-belts', slug: 'belts', name: 'Belts', parentId: 'cat-accessories' },
  { id: 'cat-wallets', slug: 'wallets', name: 'Wallets & Cardholders', parentId: 'cat-accessories' },
  { id: 'cat-jewelry', slug: 'jewelry', name: 'Jewelry', parentId: 'cat-accessories' },

  { id: 'cat-sale', slug: 'sale', name: 'Sale', parentId: null },
  { id: 'cat-flash-sale', slug: 'flash-sale', name: 'Flash Sale', parentId: 'cat-sale' },
  { id: 'cat-up-to-50-off', slug: 'up-to-50-off', name: 'Up to 50% Off', parentId: 'cat-sale' },
  { id: 'cat-clearance', slug: 'clearance', name: 'Clearance', parentId: 'cat-sale' },
  { id: 'cat-bundle-deals', slug: 'bundle-deals', name: 'Bundle Deals', parentId: 'cat-sale' },
];

function placeholderImages(seed: string, count = 2): string[] {
  // `.png` — placehold.co defaults to SVG, which Next.js `next/image` blocks by default (no `dangerouslyAllowSVG`).
  return Array.from({ length: count }, (_, i) => `https://placehold.co/800x800.png?text=${encodeURIComponent(seed)}+${String(i + 1)}`);
}

/** Single hidden SKU — Product has no Variant (glossary.md — SKU). */
function singleSku(id: string, price: number, stock = 12): Product['skus'] {
  return [{ id, price, stock, color: null, size: null }];
}

/**
 * Multiple SKUs across a Color x Size Variant tuple, optionally diverging in price to exercise "price
 * from". Stock decreases deterministically by size/color index so every variant Product has a healthy,
 * a low (<10), and — for size lists of 4+ — an out-of-stock combination to exercise all 3 UI states.
 */
function variantSkus(idPrefix: string, basePrice: number, colors: string[], sizes: string[], priceStep = 0): Product['skus'] {
  const skus: Product['skus'] = [];
  colors.forEach((color, colorIndex) => {
    sizes.forEach((size, sizeIndex) => {
      skus.push({
        id: `${idPrefix}-${String(colorIndex)}-${String(sizeIndex)}`,
        price: basePrice + sizeIndex * priceStep,
        stock: Math.max(0, 14 - sizeIndex * 5 - colorIndex * 2),
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
  description: string;
  categoryId: string;
  gender: Gender;
  skus: Product['skus'];
  rating: number;
  reviewCount: number;
}

const productSeeds: ProductSeed[] = [
  // Running (cat-running)
  {
    id: 'p-1',
    slug: 'running-shoe-alpha',
    name: 'Running Shoe Alpha',
    description: 'Giày chạy bộ nhẹ, đệm êm, thoáng khí cho quãng đường dài.',
    categoryId: 'cat-running',
    gender: 'men',
    skus: variantSkus('p-1', 1_200_000, ['black', 'white'], ['39', '40', '41', '42']),
    rating: 4.6,
    reviewCount: 128,
  },
  {
    id: 'p-2',
    slug: 'running-shoe-bolt',
    name: 'Running Shoe Bolt',
    description: 'Giày chạy bộ dáng ôm chân, phù hợp luyện tập hằng ngày.',
    categoryId: 'cat-running',
    gender: 'women',
    skus: variantSkus('p-2', 1_100_000, ['pink', 'grey'], ['36', '37', '38']),
    rating: 4.4,
    reviewCount: 76,
  },
  {
    id: 'p-3',
    slug: 'running-shoe-dash-kids',
    name: 'Running Shoe Dash Kids',
    description: 'Giày chạy bộ trẻ em, chất liệu bền, dễ vệ sinh.',
    categoryId: 'cat-running',
    gender: 'kids',
    skus: singleSku('p-3-sku', 650_000, 20),
    rating: 4.7,
    reviewCount: 43,
  },
  {
    id: 'p-4',
    slug: 'running-shoe-trail',
    name: 'Running Shoe Trail',
    description: 'Giày chạy địa hình, đế bám tốt, chống nước nhẹ.',
    categoryId: 'cat-running',
    gender: 'unisex',
    skus: variantSkus('p-4', 1_300_000, ['olive'], ['38', '39', '40', '41', '42'], 50_000),
    rating: 4.5,
    reviewCount: 61,
  },

  // Basketball (cat-basketball)
  {
    id: 'p-5',
    slug: 'basketball-high-top-court',
    name: 'Basketball High-Top Court',
    description: 'Giày bóng rổ cổ cao, hỗ trợ cổ chân, đế bám sân tốt.',
    categoryId: 'cat-basketball',
    gender: 'men',
    skus: variantSkus('p-5', 1_800_000, ['red', 'black'], ['40', '41', '42', '43']),
    rating: 4.8,
    reviewCount: 210,
  },
  {
    id: 'p-6',
    slug: 'basketball-low-top-flex',
    name: 'Basketball Low-Top Flex',
    description: 'Giày bóng rổ cổ thấp, linh hoạt, nhẹ khi di chuyển.',
    categoryId: 'cat-basketball',
    gender: 'women',
    skus: variantSkus('p-6', 1_600_000, ['white'], ['36', '37', '38'], 30_000),
    rating: 4.3,
    reviewCount: 58,
  },
  {
    id: 'p-7',
    slug: 'basketball-hoop-kids',
    name: 'Basketball Hoop Kids',
    description: 'Giày bóng rổ trẻ em, form rộng rãi, dễ mang.',
    categoryId: 'cat-basketball',
    gender: 'kids',
    skus: singleSku('p-7-sku', 750_000, 15),
    rating: 4.5,
    reviewCount: 34,
  },
  {
    id: 'p-8',
    slug: 'basketball-street-unisex',
    name: 'Basketball Street Unisex',
    description: 'Giày bóng rổ phong cách đường phố, phối đồ dễ dàng.',
    categoryId: 'cat-basketball',
    gender: 'unisex',
    skus: variantSkus('p-8', 1_500_000, ['navy', 'grey'], ['39', '40', '41']),
    rating: 4.4,
    reviewCount: 89,
  },

  // T-Shirts (cat-tshirts)
  {
    id: 'p-9',
    slug: 'tee-classic-crew',
    name: 'Tee Classic Crew',
    description: 'Áo thun cotton 100%, form regular fit, mặc hằng ngày.',
    categoryId: 'cat-tshirts',
    gender: 'men',
    skus: variantSkus('p-9', 250_000, ['black', 'white', 'grey'], ['s', 'm', 'l', 'xl']),
    rating: 4.5,
    reviewCount: 302,
  },
  {
    id: 'p-10',
    slug: 'tee-graphic-print',
    name: 'Tee Graphic Print',
    description: 'Áo thun in họa tiết, chất liệu mềm mại, form suông.',
    categoryId: 'cat-tshirts',
    gender: 'women',
    skus: variantSkus('p-10', 280_000, ['white'], ['s', 'm', 'l'], 40_000),
    rating: 4.2,
    reviewCount: 47,
  },
  {
    id: 'p-11',
    slug: 'tee-basic-kids',
    name: 'Tee Basic Kids',
    description: 'Áo thun trẻ em, vải thấm hút mồ hôi tốt.',
    categoryId: 'cat-tshirts',
    gender: 'kids',
    skus: singleSku('p-11-sku', 150_000, 25),
    rating: 4.6,
    reviewCount: 66,
  },
  {
    id: 'p-12',
    slug: 'tee-unisex-oversized',
    name: 'Tee Unisex Oversized',
    description: 'Áo thun oversized, phong cách trẻ trung, unisex.',
    categoryId: 'cat-tshirts',
    gender: 'unisex',
    skus: variantSkus('p-12', 300_000, ['sand', 'black'], ['s', 'm', 'l', 'xl']),
    rating: 4.3,
    reviewCount: 95,
  },

  // Hoodies (cat-hoodies)
  {
    id: 'p-13',
    slug: 'hoodie-pullover',
    name: 'Hoodie Pullover',
    description: 'Áo hoodie chui đầu, lót nỉ bông ấm áp.',
    categoryId: 'cat-hoodies',
    gender: 'men',
    skus: variantSkus('p-13', 650_000, ['charcoal', 'navy'], ['m', 'l', 'xl']),
    rating: 4.5,
    reviewCount: 118,
  },
  {
    id: 'p-14',
    slug: 'hoodie-zip-up',
    name: 'Hoodie Zip-Up',
    description: 'Áo hoodie khóa kéo, form vừa vặn, dễ phối đồ.',
    categoryId: 'cat-hoodies',
    gender: 'women',
    skus: variantSkus('p-14', 700_000, ['maroon'], ['s', 'm', 'l'], 25_000),
    rating: 4.4,
    reviewCount: 52,
  },
  {
    id: 'p-15',
    slug: 'hoodie-fleece-kids',
    name: 'Hoodie Fleece Kids',
    description: 'Áo hoodie nỉ trẻ em, giữ ấm tốt vào mùa lạnh.',
    categoryId: 'cat-hoodies',
    gender: 'kids',
    skus: singleSku('p-15-sku', 380_000, 18),
    rating: 4.7,
    reviewCount: 39,
  },
  {
    id: 'p-16',
    slug: 'hoodie-essential-unisex',
    name: 'Hoodie Essential Unisex',
    description: 'Áo hoodie basic, chất liệu bền, dễ kết hợp trang phục.',
    categoryId: 'cat-hoodies',
    gender: 'unisex',
    skus: variantSkus('p-16', 620_000, ['black', 'grey'], ['s', 'm', 'l', 'xl']),
    rating: 4.5,
    reviewCount: 141,
  },

  // Bags (cat-bags)
  {
    id: 'p-17',
    slug: 'backpack-commuter',
    name: 'Backpack Commuter',
    description: 'Balo đi làm/đi học, nhiều ngăn, chống nước nhẹ.',
    categoryId: 'cat-bags',
    gender: 'unisex',
    skus: singleSku('p-17-sku', 950_000, 22),
    rating: 4.6,
    reviewCount: 87,
  },
  {
    id: 'p-18',
    slug: 'backpack-mini',
    name: 'Backpack Mini',
    description: 'Balo mini, gọn nhẹ, phù hợp đi chơi/dạo phố.',
    categoryId: 'cat-bags',
    gender: 'women',
    skus: variantSkus('p-18', 720_000, ['blush', 'black'], ['one-size']),
    rating: 4.3,
    reviewCount: 29,
  },
  {
    id: 'p-19',
    slug: 'duffel-bag-sport',
    name: 'Duffel Bag Sport',
    description: 'Túi thể thao dáng dài, sức chứa lớn, quai đeo chắc chắn.',
    categoryId: 'cat-bags',
    gender: 'men',
    skus: singleSku('p-19-sku', 880_000, 16),
    rating: 4.4,
    reviewCount: 54,
  },
  {
    id: 'p-20',
    slug: 'backpack-mini-kids',
    name: 'Backpack Mini Kids',
    description: 'Balo trẻ em, hình dáng dễ thương, quai đệm êm.',
    categoryId: 'cat-bags',
    gender: 'kids',
    skus: variantSkus('p-20', 420_000, ['yellow', 'blue'], ['one-size']),
    rating: 4.8,
    reviewCount: 71,
  },

  // Hats (cat-hats)
  {
    id: 'p-21',
    slug: 'cap-snapback',
    name: 'Cap Snapback',
    description: 'Mũ snapback điều chỉnh được, chất liệu bền màu.',
    categoryId: 'cat-hats',
    gender: 'men',
    skus: singleSku('p-21-sku', 220_000, 30),
    rating: 4.2,
    reviewCount: 63,
  },
  {
    id: 'p-22',
    slug: 'cap-bucket',
    name: 'Cap Bucket',
    description: 'Mũ bucket vành tròn, che nắng tốt, phong cách trẻ trung.',
    categoryId: 'cat-hats',
    gender: 'women',
    skus: singleSku('p-22-sku', 200_000, 27),
    rating: 4.3,
    reviewCount: 48,
  },
  {
    id: 'p-23',
    slug: 'beanie-kids',
    name: 'Beanie Kids',
    description: 'Mũ len trẻ em, giữ ấm đầu vào mùa đông.',
    categoryId: 'cat-hats',
    gender: 'kids',
    skus: singleSku('p-23-sku', 130_000, 19),
    rating: 4.6,
    reviewCount: 22,
  },
  {
    id: 'p-24',
    slug: 'cap-trucker-unisex',
    name: 'Cap Trucker Unisex',
    description: 'Mũ trucker lưới sau thoáng khí, phù hợp mọi phong cách.',
    categoryId: 'cat-hats',
    gender: 'unisex',
    skus: variantSkus('p-24', 240_000, ['red', 'navy', 'black'], ['one-size']),
    rating: 4.1,
    reviewCount: 37,
  },
];

export const mockProducts: Product[] = productSeeds.map((seed) => ({
  id: seed.id,
  slug: seed.slug,
  name: seed.name,
  description: seed.description,
  images: placeholderImages(seed.name),
  categoryId: seed.categoryId,
  gender: seed.gender,
  skus: seed.skus,
  rating: seed.rating,
  reviewCount: seed.reviewCount,
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

/** Finds a Product+SKU pair by SKU id across the whole catalog — used to resolve/snapshot at Reservation/Order-commit time (issue #16). */
export function findProductBySkuId(skuId: string): { product: Product; sku: Product['skus'][number] } | undefined {
  for (const product of mockProducts) {
    const sku = product.skus.find((s) => s.id === skuId);
    if (sku !== undefined) return { product, sku };
  }
  return undefined;
}

/**
 * Permanently commits `quantity` of `skuId`'s stock (Reservation → committed on a successful Place
 * Order — Decision #38) — mutates the seeded SKU in place, clamped at 0 so a double-commit can't go
 * negative. There is no un-commit; CANCELLED/RETURNED release stock via a separate path (issue #17).
 */
export function commitSkuStock(skuId: string, quantity: number): void {
  const match = findProductBySkuId(skuId);
  if (match === undefined) return;
  match.sku.stock = Math.max(0, match.sku.stock - quantity);
}

// Snapshot taken once at module load, before any `commitSkuStock` mutation — `mockProducts[i].skus` is
// the *same* array/objects as `productSeeds[i].skus` (no clone in the `.map()` above), so "reset from
// productSeeds" would be a no-op once seeds themselves have been mutated. This is the actual baseline.
const initialStockBySkuId = new Map<string, number>(mockProducts.flatMap((p) => p.skus.map((s): [string, number] => [s.id, s.stock])));

/** Test-only — undoes in-place `commitSkuStock` mutations between FE-INT tests. */
export function resetMockCatalogStockForTesting(): void {
  for (const product of mockProducts) {
    for (const sku of product.skus) {
      const initial = initialStockBySkuId.get(sku.id);
      if (initial !== undefined) sku.stock = initial;
    }
  }
}

// --- Admin CRUD (issue #19) — read/write on the same `mockProducts` array the storefront reads from,
// so a real backend swap only has to change the transport, not the shape callers already depend on. ---

export type CatalogSort = 'newest' | 'price_asc' | 'price_desc';

export interface ListProductsQuery {
  category?: string;
  gender?: Gender;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: CatalogSort;
  page: number;
  pageSize: number;
}

function sortProducts(products: Product[], sort: CatalogSort): Product[] {
  const sorted = [...products];
  if (sort === 'price_asc') return sorted.sort((a, b) => minSkuPrice(a) - minSkuPrice(b));
  if (sort === 'price_desc') return sorted.sort((a, b) => minSkuPrice(b) - minSkuPrice(a));
  // 'newest' — mock has no createdAt, fall back to stable insertion order reversed.
  return sorted.reverse();
}

/** Shared filter+sort+paginate behind both the public PLP listing and Admin's product table — one
 * place to get right, instead of two independently-hand-rolled slices of the same logic. */
export function listProducts(query: ListProductsQuery): { data: Product[]; total: number; totalPages: number } {
  let filtered = mockProducts.slice();

  if (query.category !== undefined && query.category !== '') {
    const categoryIds = new Set(resolveCategoryIds(mockCategories, query.category));
    filtered = filtered.filter((p) => categoryIds.has(p.categoryId));
  }
  if (query.gender !== undefined) {
    filtered = filtered.filter((p) => p.gender === query.gender);
  }
  if (query.search !== undefined && query.search !== '') {
    // Accent-insensitive + slight-misspelling-tolerant (issue #11) — see search-match.ts.
    const search = query.search;
    filtered = filtered.filter((p) => matchesSearchQuery(p.name, search) || matchesSearchQuery(p.description, search));
  }
  if (query.minPrice !== undefined) {
    filtered = filtered.filter((p) => minSkuPrice(p) >= (query.minPrice ?? 0));
  }
  if (query.maxPrice !== undefined) {
    filtered = filtered.filter((p) => minSkuPrice(p) <= (query.maxPrice ?? Infinity));
  }

  filtered = sortProducts(filtered, query.sort ?? 'newest');

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / query.pageSize));
  const start = (query.page - 1) * query.pageSize;
  const data = filtered.slice(start, start + query.pageSize);

  return { data, total, totalPages };
}

export function findProductById(id: string): Product | undefined {
  return mockProducts.find((p) => p.id === id);
}

export function findProductBySlug(slug: string): Product | undefined {
  return mockProducts.find((p) => p.slug === slug);
}

let nextProductId = mockProducts.length + 1;
let nextSkuSuffix = 1;

function toSku(input: ProductInput['skus'][number]): Product['skus'][number] {
  return {
    id: input.id ?? `sku-new-${String(nextSkuSuffix++)}`,
    price: input.price,
    stock: input.stock,
    color: input.color,
    size: input.size,
  };
}

export function createProduct(input: ProductInput): Product {
  const product: Product = {
    id: `p-new-${String(nextProductId++)}`,
    slug: input.slug,
    name: input.name,
    description: input.description,
    images: input.images,
    categoryId: input.categoryId,
    gender: input.gender,
    skus: input.skus.map(toSku),
    rating: 0,
    reviewCount: 0,
  };
  mockProducts.push(product);
  return product;
}

export type ProductWriteResult = { ok: true; product: Product } | { ok: false; code: string; message: string; skuId: string };

/** Rejects if the update would remove a SKU that's referenced by an Order (issue #19) — a SKU present
 * on the live Product before the update but absent from `input.skus` is being removed. */
export function updateProduct(id: string, input: ProductInput): ProductWriteResult {
  const product = findProductById(id);
  if (product === undefined) {
    return { ok: false, code: 'NOT_FOUND', message: 'Không tìm thấy sản phẩm.', skuId: '' };
  }

  const keptSkuIds = new Set(input.skus.map((s) => s.id).filter((skuId): skuId is string => skuId !== undefined));
  const removedSkuIds = product.skus.map((s) => s.id).filter((skuId) => !keptSkuIds.has(skuId));
  const blockedSkuId = removedSkuIds.find((skuId) => isSkuReferencedInAnyOrder(skuId));
  if (blockedSkuId !== undefined) {
    return { ok: false, code: 'SKU_REFERENCED_IN_ORDER', message: 'Không thể xoá biến thể đã xuất hiện trong đơn hàng.', skuId: blockedSkuId };
  }

  product.slug = input.slug;
  product.name = input.name;
  product.description = input.description;
  product.images = input.images;
  product.categoryId = input.categoryId;
  product.gender = input.gender;
  product.skus = input.skus.map(toSku);

  return { ok: true, product };
}

export type ProductDeleteResult = { ok: true } | { ok: false; code: string; message: string };

/** Refuses to hard-delete a Product with any SKU referenced by an Order (issue #19's acceptance criteria). */
export function deleteProduct(id: string): ProductDeleteResult {
  const product = findProductById(id);
  if (product === undefined) {
    return { ok: false, code: 'NOT_FOUND', message: 'Không tìm thấy sản phẩm.' };
  }

  const referenced = product.skus.some((sku) => isSkuReferencedInAnyOrder(sku.id));
  if (referenced) {
    return { ok: false, code: 'PRODUCT_REFERENCED_IN_ORDER', message: 'Không thể xoá sản phẩm đã xuất hiện trong đơn hàng.' };
  }

  const index = mockProducts.findIndex((p) => p.id === id);
  mockProducts.splice(index, 1);
  return { ok: true };
}

const initialProductSnapshot: Product[] = mockProducts.map((p) => ({ ...p, images: [...p.images], skus: p.skus.map((s) => ({ ...s })) }));

/** Test-only — undoes create/update/delete on top of the stock reset, back to the module's seed state. */
export function resetMockCatalogProductsForTesting(): void {
  mockProducts.length = 0;
  mockProducts.push(...initialProductSnapshot.map((p) => ({ ...p, images: [...p.images], skus: p.skus.map((s) => ({ ...s })) })));
  nextProductId = mockProducts.length + 1;
  nextSkuSuffix = 1;
}

// --- Admin Category CRUD (issue #20) — same in-place-mutation pattern as the Product CRUD above. ---

export type CategoryWriteResult = { ok: true; category: Category } | { ok: false; code: string; message: string };
export type CategoryDeleteResult = { ok: true } | { ok: false; code: string; message: string };

export function findCategoryById(id: string): Category | undefined {
  return mockCategories.find((c) => c.id === id);
}

/** True if `candidateId` is `ancestorId` itself or a descendant of it — used to refuse a move that would create a cycle. */
function isSameOrDescendant(candidateId: string, ancestorId: string): boolean {
  if (candidateId === ancestorId) return true;
  const candidate = findCategoryById(candidateId);
  if (candidate?.parentId == null) return false;
  return isSameOrDescendant(candidate.parentId, ancestorId);
}

let nextCategorySuffix = 1;

export function createCategory(input: CategoryInput): CategoryWriteResult {
  if (input.parentId !== null && findCategoryById(input.parentId) === undefined) {
    return { ok: false, code: 'PARENT_NOT_FOUND', message: 'Không tìm thấy danh mục cha.' };
  }

  const category: Category = {
    id: `cat-new-${String(nextCategorySuffix++)}`,
    slug: input.slug,
    name: input.name,
    parentId: input.parentId,
  };
  mockCategories.push(category);
  return { ok: true, category };
}

/** Rejects an unknown/self/cycle-forming `parentId` (issue #20's acceptance criteria). */
export function updateCategory(id: string, input: CategoryInput): CategoryWriteResult {
  const category = findCategoryById(id);
  if (category === undefined) {
    return { ok: false, code: 'NOT_FOUND', message: 'Không tìm thấy danh mục.' };
  }

  if (input.parentId !== null) {
    if (findCategoryById(input.parentId) === undefined) {
      return { ok: false, code: 'PARENT_NOT_FOUND', message: 'Không tìm thấy danh mục cha.' };
    }
    if (isSameOrDescendant(input.parentId, id)) {
      return { ok: false, code: 'PARENT_CYCLE', message: 'Không thể đặt danh mục cha là chính nó hoặc danh mục con của nó.' };
    }
  }

  category.slug = input.slug;
  category.name = input.name;
  category.parentId = input.parentId;
  return { ok: true, category };
}

/** Refuses to delete a Category with child Categories or Products assigned to it (issue #20's acceptance criteria). */
export function deleteCategory(id: string): CategoryDeleteResult {
  const category = findCategoryById(id);
  if (category === undefined) {
    return { ok: false, code: 'NOT_FOUND', message: 'Không tìm thấy danh mục.' };
  }

  const hasChildren = mockCategories.some((c) => c.parentId === id);
  if (hasChildren) {
    return { ok: false, code: 'HAS_CHILDREN', message: 'Không thể xoá danh mục còn danh mục con.' };
  }

  const hasProducts = mockProducts.some((p) => p.categoryId === id);
  if (hasProducts) {
    return { ok: false, code: 'HAS_PRODUCTS', message: 'Không thể xoá danh mục đang có sản phẩm.' };
  }

  const index = mockCategories.findIndex((c) => c.id === id);
  mockCategories.splice(index, 1);
  return { ok: true };
}

const initialCategorySnapshot: Category[] = mockCategories.map((c) => ({ ...c }));

/** Test-only — undoes create/update/delete, back to the module's seed state. */
export function resetMockCategoriesForTesting(): void {
  mockCategories.length = 0;
  mockCategories.push(...initialCategorySnapshot.map((c) => ({ ...c })));
  nextCategorySuffix = 1;
}
