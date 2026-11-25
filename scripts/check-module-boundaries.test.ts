// @vitest-environment node
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import type { BoundaryPolicy } from './check-module-boundaries';
import {
  checkCoverageManifest,
  checkModuleBoundaries,
  collectCoverageFiles,
  COVERAGE_MANIFEST,
  DEFAULT_POLICY,
  findCycles,
  locate,
} from './check-module-boundaries';

let root: string;

function write(path: string, contents = 'export const value = 1;\n'): void {
  const target = join(root, path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, contents);
}

const policy: BoundaryPolicy = {
  modules: ['cart', 'catalog', 'checkout', 'wishlist'],
  publicEntries: [
    { consumers: ['checkout'], target: 'cart:hooks/useCart', symbols: ['useCart', 'CartLine'] },
    { consumers: ['wishlist'], target: 'catalog:priceRange', symbols: ['getProductPriceRange'] },
    { consumers: ['app:[locale]/(shop)/products/page'], target: 'catalog:ProductsClient', symbols: ['default'] },
  ],
  knownViolations: [],
  knownCycles: [],
};

function rules(target: BoundaryPolicy = policy): string[] {
  return checkModuleBoundaries(root, target).violations.map((violation) => `${violation.rule} ${violation.file}`);
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'module-boundaries-'));
  write('src/features/cart/hooks/useCart.ts', 'export const useCart = () => 1;\nexport type CartLine = { id: string };\n');
  write('src/features/cart/stores/cart.store.ts', 'export const clearCart = () => undefined;\n');
  write('src/features/catalog/priceRange.ts', 'export const getProductPriceRange = () => 1;\nexport const internalRange = 2;\n');
  write('src/features/catalog/ProductsClient.tsx', 'export default function ProductsClient() { return null; }\n');
});

afterEach(() => rmSync(root, { recursive: true, force: true }));

describe('locate', () => {
  it.each([
    ['src/features/catalog/priceRange.ts', 'catalog:priceRange'],
    ['src/modules/catalog/priceRange.ts', 'catalog:priceRange'],
    ['src/features/storefront-shell/components/Header.tsx', 'layouts:components/Header'],
    ['src/layouts/components/Header.tsx', 'layouts:components/Header'],
    ['src/app/_composition/AppProviders.tsx', 'providers:AppProviders'],
    ['src/providers/AppProviders.tsx', 'providers:AppProviders'],
    ['src/lib/schemas/cart/cart.ts', 'integrations:schemas/cart/cart'],
    ['src/integrations/backend/schemas/cart/cart.ts', 'integrations:schemas/cart/cart'],
    ['src/app/[locale]/(shop)/cart/page.tsx', 'app:[locale]/(shop)/cart/page'],
    ['src/i18n/request.ts', 'platform:i18n/request'],
  ])('maps %s to the logical owner %s', (path, key) => {
    expect(locate(path).key).toBe(key);
  });
});

describe('checkModuleBoundaries public entries', () => {
  it('accepts allowlisted named, type and default imports from old and new roots', () => {
    write(
      'src/features/checkout/useCreateOrder.ts',
      "import { useCart } from '@/features/cart/hooks/useCart';\nimport type { CartLine } from '@/features/cart/hooks/useCart';\n",
    );
    write('src/modules/wishlist/WishlistClient.tsx', "import { getProductPriceRange } from '@/features/catalog/priceRange';\n");
    write('src/app/[locale]/(shop)/products/page.tsx', "import ProductsClient from '@/features/catalog/ProductsClient';\n");

    expect(rules()).toEqual([]);
  });

  it('allows a module to import its own private files and tests', () => {
    write('src/features/cart/hooks/useCart.test.ts', "import { clearCart } from '@/features/cart/stores/cart.store';\nvi.mock('./useCart');\n");

    expect(rules()).toEqual([]);
  });

  it('rejects a private file of another module', () => {
    write('src/features/checkout/useCreateOrder.ts', "import { clearCart } from '@/features/cart/stores/cart.store';\n");

    expect(rules()).toEqual(['private src/features/checkout/useCreateOrder.ts']);
  });

  it('rejects a symbol that is not listed for that consumer', () => {
    write('src/features/wishlist/WishlistClient.tsx', "import { getProductPriceRange, internalRange } from '@/features/catalog/priceRange';\n");
    write('src/features/checkout/Summary.tsx', "import { getProductPriceRange } from '@/features/catalog/priceRange';\n");

    const violations = checkModuleBoundaries(root, policy).violations;

    expect(violations.map((violation) => violation.rule).sort()).toEqual(['private', 'wrong-symbol']);
    expect(violations.find((violation) => violation.rule === 'wrong-symbol')?.message).toContain('internalRange');
  });

  it.each([
    ['namespace import', "import * as cart from '@/features/cart/hooks/useCart';\n", 'namespace'],
    ['side-effect import', "import '@/features/cart/hooks/useCart';\n", 'namespace'],
    ['dynamic import', "export const load = () => import('@/features/cart/hooks/useCart');\n", 'namespace'],
    ['test mock string', "vi.mock('@/features/cart/stores/cart.store');\n", 'namespace'],
    ['named re-export', "export { useCart } from '@/features/cart/hooks/useCart';\n", 'reexport'],
    ['star re-export', "export * from '@/features/cart/hooks/useCart';\n", 'reexport'],
  ])('rejects a %s across modules', (_label, source, rule) => {
    write('src/features/checkout/consumer.test.ts', source);

    expect(rules()).toEqual([`${rule} src/features/checkout/consumer.test.ts`]);
  });

  it('rejects a default import unless the entry lists default', () => {
    write('src/features/checkout/Summary.tsx', "import ProductsClient from '@/features/catalog/ProductsClient';\n");

    expect(rules()).toEqual(['private src/features/checkout/Summary.tsx']);
  });

  it('reports internal specifiers that no longer resolve', () => {
    write('src/features/checkout/Summary.test.tsx', "vi.mock('@/features/cart/hooks/missing');\n");

    expect(rules()).toEqual(['unresolved src/features/checkout/Summary.test.tsx']);
  });

  it('flags a module root missing from the policy', () => {
    write('src/features/loyalty/points.ts');

    expect(rules()).toEqual(['unregistered-module src/features/loyalty/points.ts']);
  });
});

describe('checkModuleBoundaries layers', () => {
  it.each([
    ['src/features/cart/useLayout.ts', "import { value } from '@/layouts/Header';\n"],
    ['src/modules/cart/useApp.ts', "import { value } from '@/app/_composition/AppProviders';\n"],
    ['src/shared/useCart.ts', "import { useCart } from '@/features/cart/hooks/useCart';\n"],
    ['src/integrations/backend/client.ts', "import { value } from '@/providers/query-client';\n"],
  ])('rejects %s importing up the dependency direction', (file, source) => {
    write('src/layouts/Header.tsx');
    write('src/app/_composition/AppProviders.tsx');
    write('src/providers/query-client.ts');
    write(file, source);

    expect(rules()).toEqual([`layer ${file}`]);
  });

  it('lets layouts and providers compose public entries', () => {
    write('src/layouts/Header.tsx', "import { useCart } from '@/features/cart/hooks/useCart';\nimport { value } from '@/shared/flag';\n");
    write('src/shared/flag.ts');
    const composition: BoundaryPolicy = {
      ...policy,
      publicEntries: [...policy.publicEntries, { consumers: ['layouts'], target: 'cart:hooks/useCart', symbols: ['useCart'] }],
    };

    expect(rules(composition)).toEqual([]);
  });
});

describe('checkModuleBoundaries snapshots and cycles', () => {
  beforeEach(() => {
    write('src/features/catalog/ProductCard.tsx', "import { useIsWishlisted } from '@/features/wishlist/useWishlist';\n");
    write(
      'src/features/wishlist/useWishlist.ts',
      "import { getProductPriceRange } from '@/features/catalog/priceRange';\nexport const useIsWishlisted = () => false;\n",
    );
  });

  const snapshot: BoundaryPolicy = {
    ...policy,
    knownViolations: [{ from: 'catalog:ProductCard', to: 'wishlist:useWishlist', symbols: ['useIsWishlisted'], removedBy: '38', reason: 'pilot' }],
    knownCycles: [{ modules: ['wishlist', 'catalog'], removedBy: '38', reason: 'pilot' }],
  };

  it('fails a module cycle and the private edge without a snapshot', () => {
    expect(rules().sort()).toEqual(['cycle src', 'private src/features/catalog/ProductCard.tsx']);
  });

  it('accepts the exact snapshotted edge and cycle from the new root', () => {
    rmSync(join(root, 'src/features/catalog'), { recursive: true });
    write('src/modules/catalog/priceRange.ts', 'export const getProductPriceRange = () => 1;\n');
    write('src/modules/catalog/ProductCard.tsx', "import { useIsWishlisted } from '@/features/wishlist/useWishlist';\n");
    write('src/modules/catalog/ProductsClient.tsx', 'export default function ProductsClient() { return null; }\n');
    write(
      'src/features/wishlist/useWishlist.ts',
      "import { getProductPriceRange } from '@/modules/catalog/priceRange';\nexport const useIsWishlisted = () => false;\n",
    );

    const result = checkModuleBoundaries(root, snapshot);

    expect(result.violations).toEqual([]);
    expect(result.knownInUse).toEqual(['catalog:ProductCard → wishlist:useWishlist (until 38)', 'cycle wishlist ↔ catalog (until 38)']);
  });

  it('rejects a snapshotted edge that gains a new symbol', () => {
    write('src/features/catalog/ProductCard.tsx', "import { useIsWishlisted, useWishlist } from '@/features/wishlist/useWishlist';\n");

    expect(rules(snapshot)).toEqual(['private src/features/catalog/ProductCard.tsx']);
  });

  it('reports stale snapshots once the edge and cycle are gone', () => {
    write('src/features/catalog/ProductCard.tsx', 'export const ProductCard = () => null;\n');

    expect(rules(snapshot)).toEqual(['stale-exception scripts/check-module-boundaries.ts', 'stale-exception scripts/check-module-boundaries.ts']);
  });

  it('does not build module cycles from test-only edges', () => {
    write('src/features/catalog/ProductCard.tsx', 'export const ProductCard = () => null;\n');
    write('src/features/catalog/ProductCard.test.tsx', "import { useIsWishlisted } from '@/features/wishlist/useWishlist';\n");

    expect(rules()).toEqual(['private src/features/catalog/ProductCard.test.tsx']);
  });
});

describe('findCycles', () => {
  it('returns each strongly connected component with more than one module', () => {
    const graph = new Map([
      ['a', new Set(['b'])],
      ['b', new Set(['c'])],
      ['c', new Set(['a'])],
      ['d', new Set(['a'])],
    ]);

    expect(findCycles(graph)).toEqual([['a', 'b', 'c']]);
  });
});

describe('coverage old→new manifest', () => {
  const manifest = {
    'src/shared/lib/motion.ts': ['src/shared/styles/motion.ts'],
    'src/shared/hooks/useMediaQuery.ts': null,
  };

  it('accepts files collected at either their old or their new path', () => {
    write('src/shared/styles/motion.ts');
    write('src/shared/hooks/useMediaQuery.ts');
    const collected = collectCoverageFiles(root, { include: ['src/shared/styles/**/*.ts', 'src/shared/hooks/**/*.ts'], exclude: [] });

    expect(collected).toEqual(['src/shared/hooks/useMediaQuery.ts', 'src/shared/styles/motion.ts']);
    expect(checkCoverageManifest(root, collected, manifest)).toEqual([]);
  });

  it('fails when a moved file falls out of the coverage globs', () => {
    write('src/shared/styles/motion.ts');
    write('src/shared/hooks/useMediaQuery.ts');

    expect(checkCoverageManifest(root, ['src/shared/hooks/useMediaQuery.ts'], manifest)).toEqual([
      'src/shared/lib/motion.ts moved to src/shared/styles/motion.ts, which coverage no longer collects.',
    ]);
  });

  it('fails for unmapped collected files, dropped old files and vanished owners', () => {
    write('src/shared/hooks/useMediaQuery.ts');
    write('src/shared/lib/seo.ts');

    expect(checkCoverageManifest(root, ['src/shared/lib/seo.ts'], manifest)).toEqual([
      'src/shared/lib/seo.ts is collected by coverage but missing from the old→new manifest.',
      'src/shared/lib/motion.ts is gone and no manifest target exists (src/shared/styles/motion.ts).',
      'src/shared/hooks/useMediaQuery.ts still exists but is no longer collected by coverage.',
    ]);
  });
});

describe('repository policy', () => {
  it('keeps every known exception tied to a delivery slice and a reason', () => {
    for (const known of [...DEFAULT_POLICY.knownViolations, ...DEFAULT_POLICY.knownCycles]) {
      expect(known.removedBy).toMatch(/^\d{2}-storefront-/);
      expect(known.reason.length).toBeGreaterThan(10);
    }
  });

  it('allowlists only registered modules and never a wildcard symbol', () => {
    for (const entry of DEFAULT_POLICY.publicEntries) {
      expect(DEFAULT_POLICY.modules).toContain(entry.target.split(':')[0]);
      expect(entry.symbols).not.toContain('*');
    }
  });

  it('maps every coverage manifest entry inside src', () => {
    for (const [oldPath, newPaths] of Object.entries(COVERAGE_MANIFEST)) {
      expect(oldPath).toMatch(/^src\//);
      for (const path of newPaths ?? []) expect(path).toMatch(/^src\//);
    }
  });
});
