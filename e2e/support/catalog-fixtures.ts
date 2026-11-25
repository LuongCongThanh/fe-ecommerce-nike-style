import type { components } from '../../src/lib/api/generated/openapi';

type ProductListItem = components['schemas']['ProductListItemResponseDto'];
type ProductDetail = components['schemas']['ProductDetailResponseDto'];
type CategoryTreeNode = components['schemas']['CategoryTreeNodeDto'];
type Size = components['schemas']['SizeResponseDto'];
type Color = components['schemas']['ColorResponseDto'];

export interface CatalogProductFixture {
  product: ProductListItem;
  searchTerms: string[];
}

const publishedAt = '2026-01-01T00:00:00.000Z';

const seeds = [
  ['p-1', 'running-shoe-alpha', 'Running Shoe Alpha', 'cat-running', 'MEN', 1_200_000, ['giay chay bo']],
  ['p-2', 'running-shoe-bolt', 'Running Shoe Bolt', 'cat-running', 'WOMEN', 1_100_000, []],
  ['p-3', 'running-shoe-dash-kids', 'Running Shoe Dash Kids', 'cat-running', 'KIDS', 650_000, []],
  ['p-4', 'running-shoe-trail', 'Running Shoe Trail', 'cat-running', 'UNISEX', 1_300_000, []],
  ['p-5', 'basketball-high-top-court', 'Basketball High-Top Court', 'cat-basketball', 'MEN', 1_800_000, []],
  ['p-6', 'basketball-low-top-flex', 'Basketball Low-Top Flex', 'cat-basketball', 'WOMEN', 1_600_000, []],
  ['p-7', 'basketball-hoop-kids', 'Basketball Hoop Kids', 'cat-basketball', 'KIDS', 780_000, []],
  ['p-8', 'tee-training-core', 'Tee Training Core', 'cat-tshirts', 'MEN', 280_000, []],
  ['p-9', 'tee-running-light', 'Tee Running Light', 'cat-tshirts', 'WOMEN', 320_000, []],
  ['p-10', 'tee-training-kids', 'Tee Training Kids', 'cat-tshirts', 'KIDS', 180_000, []],
  ['p-11', 'tee-basic-kids', 'Tee Basic Kids', 'cat-tshirts', 'KIDS', 150_000, []],
  ['p-12', 'tee-unisex-oversized', 'Tee Unisex Oversized', 'cat-tshirts', 'UNISEX', 300_000, []],
  ['p-13', 'hoodie-pullover', 'Hoodie Pullover', 'cat-hoodies', 'MEN', 650_000, []],
  ['p-14', 'hoodie-zip-up', 'Hoodie Zip-Up', 'cat-hoodies', 'WOMEN', 700_000, []],
  ['p-15', 'hoodie-fleece-kids', 'Hoodie Fleece Kids', 'cat-hoodies', 'KIDS', 380_000, []],
  ['p-16', 'hoodie-essential-unisex', 'Hoodie Essential Unisex', 'cat-hoodies', 'UNISEX', 620_000, []],
  ['p-17', 'backpack-commuter', 'Backpack Commuter', 'cat-bags', 'UNISEX', 950_000, []],
  ['p-18', 'backpack-mini', 'Backpack Mini', 'cat-bags', 'WOMEN', 720_000, []],
  ['p-19', 'duffel-bag-sport', 'Duffel Bag Sport', 'cat-bags', 'MEN', 880_000, []],
  ['p-20', 'backpack-mini-kids', 'Backpack Mini Kids', 'cat-bags', 'KIDS', 420_000, []],
  ['p-21', 'cap-snapback', 'Cap Snapback', 'cat-hats', 'MEN', 220_000, []],
  ['p-22', 'cap-bucket', 'Cap Bucket', 'cat-hats', 'WOMEN', 200_000, []],
  ['p-23', 'beanie-kids', 'Beanie Kids', 'cat-hats', 'KIDS', 130_000, []],
  ['p-24', 'sports-socks', 'Sports Socks', 'cat-accessories', 'UNISEX', 90_000, []],
] as const;

export const catalogProducts: CatalogProductFixture[] = seeds.map(([id, slug, name, categoryId, gender, price, searchTerms]) => ({
  product: {
    id,
    slug,
    name,
    categoryId,
    gender,
    imageUrl: null,
    maxDiscountPercent: 0,
    maxPrice: price,
    minPrice: price,
    minRegularPrice: price,
    description: null,
    createdAt: publishedAt,
    publishedAt,
    status: 'ACTIVE',
    updatedAt: publishedAt,
    weightGrams: 500,
  },
  searchTerms: [...searchTerms],
}));

export const categoryTree: CategoryTreeNode[] = [
  {
    id: 'cat-shoes',
    slug: 'shoes',
    name: 'Shoes',
    children: [
      { id: 'cat-running', slug: 'running', name: 'Running', children: [] },
      { id: 'cat-basketball', slug: 'basketball', name: 'Basketball', children: [] },
    ],
  },
  {
    id: 'cat-tops',
    slug: 'tops',
    name: 'Tops',
    children: [
      { id: 'cat-tshirts', slug: 't-shirts', name: 'T-Shirts', children: [] },
      { id: 'cat-hoodies', slug: 'hoodies', name: 'Hoodies & Sweatshirts', children: [] },
    ],
  },
  { id: 'cat-bags', slug: 'bags', name: 'Bags', children: [] },
  {
    id: 'cat-accessories',
    slug: 'accessories',
    name: 'Accessories',
    children: [{ id: 'cat-hats', slug: 'hats', name: 'Hats & Caps', children: [] }],
  },
];

export const catalogSizes: Size[] = [
  { id: 'size-39', code: '39', name: '39', isHidden: false, sortOrder: 1 },
  { id: 'size-40', code: '40', name: '40', isHidden: false, sortOrder: 2 },
  { id: 'size-42', code: '42', name: '42', isHidden: false, sortOrder: 3 },
];

export const catalogColors: Color[] = [
  { id: 'color-black', code: 'black', name: 'black', hex: '#111111', isHidden: false },
  { id: 'color-white', code: 'white', name: 'white', hex: '#FFFFFF', isHidden: false },
];

const detailVariants: ProductDetail['variants'] = [
  ...['black', 'white'].flatMap((colorCode, colorIndex) =>
    ['39', '40', '41', '42'].map((sizeCode, sizeIndex) => ({
      id: `variant-${String(colorIndex)}-${String(sizeIndex)}`,
      sku: `RUN-${colorCode.toUpperCase()}-${sizeCode}`,
      productId: 'p-1',
      status: 'ACTIVE' as const,
      price: 1_200_000 + sizeIndex * 10_000,
      createdAt: publishedAt,
      updatedAt: publishedAt,
      color: {
        id: `color-${colorCode}`,
        code: colorCode,
        name: colorCode,
        hex: colorCode === 'black' ? '#111111' : '#FFFFFF',
      },
      size: { id: `size-${sizeCode}`, code: sizeCode, name: sizeCode },
    })),
  ),
];

export const productDetails: ProductDetail[] = [
  {
    id: 'p-1',
    slug: 'running-shoe-alpha',
    name: 'Running Shoe Alpha',
    description: 'Lightweight running shoes for everyday training.',
    categoryId: 'cat-running',
    gender: 'MEN',
    status: 'ACTIVE',
    publishedAt,
    createdAt: publishedAt,
    updatedAt: publishedAt,
    weightGrams: 500,
    variants: detailVariants,
    images: [],
  },
  {
    id: 'p-17',
    slug: 'backpack-commuter',
    name: 'Backpack Commuter',
    description: 'A commuter backpack with practical storage.',
    categoryId: 'cat-bags',
    gender: 'UNISEX',
    status: 'ACTIVE',
    publishedAt,
    createdAt: publishedAt,
    updatedAt: publishedAt,
    weightGrams: 700,
    variants: [],
    images: [],
  },
];
