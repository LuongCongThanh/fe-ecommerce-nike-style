import type { components } from '@/lib/api/generated/openapi';

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

interface ProductSeed {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly categoryId: string;
  readonly gender: ProductListItem['gender'];
  readonly price: number;
  /** Extra unaccented words the harness search matches, e.g. Vietnamese queries typed without diacritics. */
  readonly searchTerms?: readonly string[];
}

const productSeeds: readonly ProductSeed[] = [
  {
    id: 'p-1',
    slug: 'running-shoe-alpha',
    name: 'Running Shoe Alpha',
    categoryId: 'cat-running',
    gender: 'MEN',
    price: 1_200_000,
    searchTerms: ['giay chay bo'],
  },
  { id: 'p-2', slug: 'running-shoe-bolt', name: 'Running Shoe Bolt', categoryId: 'cat-running', gender: 'WOMEN', price: 1_100_000 },
  { id: 'p-3', slug: 'running-shoe-dash-kids', name: 'Running Shoe Dash Kids', categoryId: 'cat-running', gender: 'KIDS', price: 650_000 },
  { id: 'p-4', slug: 'running-shoe-trail', name: 'Running Shoe Trail', categoryId: 'cat-running', gender: 'UNISEX', price: 1_300_000 },
  { id: 'p-5', slug: 'basketball-high-top-court', name: 'Basketball High-Top Court', categoryId: 'cat-basketball', gender: 'MEN', price: 1_800_000 },
  { id: 'p-6', slug: 'basketball-low-top-flex', name: 'Basketball Low-Top Flex', categoryId: 'cat-basketball', gender: 'WOMEN', price: 1_600_000 },
  { id: 'p-7', slug: 'basketball-hoop-kids', name: 'Basketball Hoop Kids', categoryId: 'cat-basketball', gender: 'KIDS', price: 780_000 },
  { id: 'p-8', slug: 'tee-training-core', name: 'Tee Training Core', categoryId: 'cat-tshirts', gender: 'MEN', price: 280_000 },
  { id: 'p-9', slug: 'tee-running-light', name: 'Tee Running Light', categoryId: 'cat-tshirts', gender: 'WOMEN', price: 320_000 },
  { id: 'p-10', slug: 'tee-training-kids', name: 'Tee Training Kids', categoryId: 'cat-tshirts', gender: 'KIDS', price: 180_000 },
  { id: 'p-11', slug: 'tee-basic-kids', name: 'Tee Basic Kids', categoryId: 'cat-tshirts', gender: 'KIDS', price: 150_000 },
  { id: 'p-12', slug: 'tee-unisex-oversized', name: 'Tee Unisex Oversized', categoryId: 'cat-tshirts', gender: 'UNISEX', price: 300_000 },
  { id: 'p-13', slug: 'hoodie-pullover', name: 'Hoodie Pullover', categoryId: 'cat-hoodies', gender: 'MEN', price: 650_000 },
  { id: 'p-14', slug: 'hoodie-zip-up', name: 'Hoodie Zip-Up', categoryId: 'cat-hoodies', gender: 'WOMEN', price: 700_000 },
  { id: 'p-15', slug: 'hoodie-fleece-kids', name: 'Hoodie Fleece Kids', categoryId: 'cat-hoodies', gender: 'KIDS', price: 380_000 },
  { id: 'p-16', slug: 'hoodie-essential-unisex', name: 'Hoodie Essential Unisex', categoryId: 'cat-hoodies', gender: 'UNISEX', price: 620_000 },
  { id: 'p-17', slug: 'backpack-commuter', name: 'Backpack Commuter', categoryId: 'cat-bags', gender: 'UNISEX', price: 950_000 },
  { id: 'p-18', slug: 'backpack-mini', name: 'Backpack Mini', categoryId: 'cat-bags', gender: 'WOMEN', price: 720_000 },
  { id: 'p-19', slug: 'duffel-bag-sport', name: 'Duffel Bag Sport', categoryId: 'cat-bags', gender: 'MEN', price: 880_000 },
  { id: 'p-20', slug: 'backpack-mini-kids', name: 'Backpack Mini Kids', categoryId: 'cat-bags', gender: 'KIDS', price: 420_000 },
  { id: 'p-21', slug: 'cap-snapback', name: 'Cap Snapback', categoryId: 'cat-hats', gender: 'MEN', price: 220_000 },
  { id: 'p-22', slug: 'cap-bucket', name: 'Cap Bucket', categoryId: 'cat-hats', gender: 'WOMEN', price: 200_000 },
  { id: 'p-23', slug: 'beanie-kids', name: 'Beanie Kids', categoryId: 'cat-hats', gender: 'KIDS', price: 130_000 },
  { id: 'p-24', slug: 'sports-socks', name: 'Sports Socks', categoryId: 'cat-accessories', gender: 'UNISEX', price: 90_000 },
];

export const catalogProducts: CatalogProductFixture[] = productSeeds.map(({ id, slug, name, categoryId, gender, price, searchTerms = [] }) => ({
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
