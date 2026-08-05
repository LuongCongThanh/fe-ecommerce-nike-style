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
