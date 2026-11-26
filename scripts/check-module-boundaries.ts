/**
 * Module boundary checker for the Storefront migration (task 35).
 *
 * ESLint keeps the path-level layer zones (see `eslint.boundaries.mjs`, which also owns the module list). This script enforces what
 * ESLint cannot express: the public entry matrix (consumer + owner file + named symbol), module-level
 * cycles, exact snapshots of known violations and the coverage old→new manifest.
 *
 * Old and new paths map to the same logical owner, e.g. `src/features/catalog/priceRange.ts` and
 * `src/modules/catalog/priceRange.ts` are both `catalog:priceRange`. Design source:
 * docs/plan/tasks/18-storefront-module-boundaries/boundaries.md.
 */
import { existsSync, globSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

import ts from 'typescript';

// One module registry for ESLint zones and this checker.
import { DOMAIN_MODULES } from '../eslint.boundaries.mjs';

/** Composition units may wire domain modules together through public entries. */
const COMPOSITION_UNITS = new Set(['app', 'layouts', 'providers']);
/** Foundation units never depend on domain modules or composition. */
const FOUNDATION_UNITS = new Set(['shared', 'integrations', 'platform']);

/** Ordered: the first matching prefix wins. `logicalPrefix` keeps old and new paths on one identity. */
const ROOTS: ReadonlyArray<{ prefix: string; unit: string; logicalPrefix?: string }> = [
  { prefix: 'src/features/storefront-shell/', unit: 'layouts' },
  { prefix: 'src/layouts/', unit: 'layouts' },
  { prefix: 'src/app/_composition/', unit: 'providers' },
  { prefix: 'src/providers/', unit: 'providers' },
  { prefix: 'src/app/', unit: 'app' },
  { prefix: 'src/shared/', unit: 'shared' },
  { prefix: 'src/integrations/backend/', unit: 'integrations' },
  { prefix: 'src/testing/', unit: 'testing' },
];

const SOURCE_EXTENSIONS = ['.ts', '.tsx'];
const RESOLVE_SUFFIXES = ['', '.ts', '.tsx', '.js', '.mjs', '.json', '/index.ts', '/index.tsx'];
const IGNORED_DIRS = new Set(['src/integrations/backend/generated']);

export interface PublicEntry {
  /** Unit names (`layouts`, `wishlist`, …) or one exact app file as `app:<logical path>`. */
  consumers: readonly string[];
  /** Logical owner file, e.g. `catalog:components/ProductCard`. */
  target: string;
  /** Named symbols; `default` for a default import. Namespace/side-effect access is never public. */
  symbols: readonly string[];
}

export interface KnownViolation {
  from: string;
  to: string;
  symbols: readonly string[];
  /** Delivery task folder that deletes this edge. */
  removedBy: string;
  reason: string;
}

export interface KnownCycle {
  modules: readonly string[];
  removedBy: string;
  reason: string;
}

export interface BoundaryPolicy {
  modules: readonly string[];
  publicEntries: readonly PublicEntry[];
  knownViolations: readonly KnownViolation[];
  knownCycles: readonly KnownCycle[];
}

const app = (route: string): string => `app:[locale]/${route}`;

/**
 * Public entry matrix. Targets use the owner file's current basename; a slice that renames an entry
 * (ADR suffixes such as `.service`) updates the target here in the same change.
 */
export const PUBLIC_ENTRIES: readonly PublicEntry[] = [
  // home → catalog
  { consumers: ['home'], target: 'catalog:components/ProductCard', symbols: ['ProductCard'] },
  { consumers: ['home'], target: 'catalog:components/CategoryCard', symbols: ['CategoryCard'] },
  { consumers: ['home', 'layouts'], target: 'catalog:queries/useCategoryTree', symbols: ['useCategoryTree'] },
  { consumers: ['home'], target: 'catalog:queries/catalogKeys', symbols: ['catalogKeys'] },
  // layouts / providers → domain modules
  { consumers: ['layouts'], target: 'catalog:search/hooks/useHeaderSearch', symbols: ['useHeaderSearch'] },
  { consumers: ['layouts'], target: 'auth:session/useAuth', symbols: ['useAuth'] },
  { consumers: ['providers'], target: 'auth:session/AuthRuntimeProvider', symbols: ['AuthRuntimeProvider'] },
  { consumers: ['layouts'], target: 'cart:components/CartDrawer', symbols: ['CartDrawer'] },
  { consumers: ['layouts'], target: 'cart:hooks/useCart', symbols: ['useCart', 'mergeCartOnLogin'] },
  { consumers: ['layouts'], target: 'wishlist:hooks/useWishlist', symbols: ['useWishlist', 'mergeWishlistOnLogin', 'useIsWishlisted'] },
  // wishlist → catalog/cart
  { consumers: ['wishlist'], target: 'catalog:priceRange', symbols: ['getProductPriceRange'] },
  { consumers: ['wishlist'], target: 'catalog:variantResolution', symbols: ['getVariantAxes', 'resolveSku'] },
  { consumers: ['wishlist'], target: 'cart:hooks/useCart', symbols: ['useCart'] },
  // checkout → cart/orders
  { consumers: ['checkout'], target: 'cart:hooks/useCart', symbols: ['useCart', 'CartLine'] },
  { consumers: ['checkout'], target: 'orders:queries/orderKeys', symbols: ['orderKeys'] },
  // app entries
  { consumers: [app('(auth)/forgot-password/page')], target: 'auth:forgot-password/components/ForgotPasswordForm', symbols: ['ForgotPasswordForm'] },
  { consumers: [app('(auth)/login/page')], target: 'auth:login/components/LoginForm', symbols: ['LoginForm'] },
  { consumers: [app('(auth)/register/page')], target: 'auth:register/components/RegisterForm', symbols: ['RegisterForm'] },
  {
    consumers: [app('(auth)/reset-password/[token]/page')],
    target: 'auth:reset-password/components/ResetPasswordForm',
    symbols: ['ResetPasswordForm'],
  },
  // Design target basename: auth/schemas/auth.schema (renamed in the auth slice).
  { consumers: [app('(auth)/reset-password/[token]/page')], target: 'auth:schemas/auth', symbols: ['isValidResetPasswordRequest'] },
  { consumers: [app('(shop)/account/addresses/page')], target: 'account:addresses/components/AddressesClient', symbols: ['AddressesClient'] },
  { consumers: [app('(shop)/account/layout'), app('(shop)/checkout/layout')], target: 'auth:session/AuthGuard', symbols: ['AuthGuard'] },
  { consumers: [app('(shop)/account/orders/[id]/page')], target: 'orders:order-detail/components/OrderDetailClient', symbols: ['OrderDetailClient'] },
  { consumers: [app('(shop)/account/orders/page')], target: 'orders:order-list/components/OrdersClient', symbols: ['OrdersClient'] },
  { consumers: [app('(shop)/account/profile/page')], target: 'account:profile/components/ProfileClient', symbols: ['ProfileClient'] },
  { consumers: [app('(shop)/cart/page')], target: 'cart:components/CartClient', symbols: ['CartClient'] },
  {
    consumers: [app('(shop)/categories/[slug]/page')],
    target: 'catalog:category-detail/components/CategoryPageClient',
    symbols: ['CategoryPageClient'],
  },
  { consumers: [app('(shop)/checkout/page')], target: 'checkout:components/CheckoutClient', symbols: ['CheckoutClient'] },
  { consumers: [app('(shop)/checkout/page')], target: 'checkout:components/OrderSummary', symbols: ['OrderSummary'] },
  { consumers: [app('(shop)/checkout/page')], target: 'checkout:hooks/useCheckoutForm', symbols: ['useCheckoutForm'] },
  // Design target basename: orders/services/order.service (renamed in the orders slice).
  { consumers: [app('(shop)/checkout/success/page')], target: 'orders:services/order', symbols: ['getOrderOrNull'] },
  { consumers: [app('(shop)/home/page')], target: 'home:components/SectionEditorialCollection', symbols: ['SectionEditorialCollection'] },
  { consumers: [app('(shop)/home/page')], target: 'home:components/SectionFeaturedCategories', symbols: ['SectionFeaturedCategories'] },
  { consumers: [app('(shop)/home/page')], target: 'home:components/SectionHero', symbols: ['SectionHero'] },
  { consumers: [app('(shop)/home/page')], target: 'home:components/SectionNewArrivals', symbols: ['SectionNewArrivals'] },
  { consumers: [app('(shop)/home/page')], target: 'home:components/SectionNewsletter', symbols: ['SectionNewsletter'] },
  { consumers: [app('(shop)/home/page')], target: 'home:components/SectionWhyChooseUs', symbols: ['SectionWhyChooseUs'] },
  {
    consumers: [app('(shop)/products/[slug]/page')],
    target: 'catalog:product-detail/components/ProductDetailPageClient',
    symbols: ['ProductDetailPageClient'],
  },
  { consumers: [app('(shop)/products/page')], target: 'catalog:components/FilterSidebar', symbols: ['FilterSidebar'] },
  { consumers: [app('(shop)/products/page')], target: 'catalog:product-list/components/ProductsClient', symbols: ['default'] },
  { consumers: [app('(shop)/search/page')], target: 'catalog:search/components/SearchClient', symbols: ['SearchClient'] },
  { consumers: [app('(shop)/wishlist/page')], target: 'wishlist:components/WishlistClient', symbols: ['WishlistClient'] },
];

/** Exact edges that exist today and are deleted by a named delivery slice. Never add wildcards. */
export const KNOWN_VIOLATIONS: readonly KnownViolation[] = [
  {
    from: 'wishlist:components/WishlistClient.test',
    to: 'cart:stores/cart.store',
    symbols: ['clearCart', 'resetCartState', 'useCartStore'],
    removedBy: '41-storefront-cart-wishlist-migration',
    reason: 'Move-to-cart test seeds and reads the private cart store; replaced by an owner test entry/fixture.',
  },
  {
    from: 'providers:AppProviders.test',
    to: 'auth:stores/auth.store',
    symbols: ['*'],
    removedBy: '40-storefront-auth-account-migration',
    reason: 'Provider lifecycle test mocks the private auth store for bootstrap; replaced when auth exposes a runtime test seam.',
  },
  {
    from: 'checkout:queries/useCreateOrder',
    to: 'cart:stores/cart.store',
    symbols: ['clearCart'],
    removedBy: '42-storefront-orders-checkout-migration',
    reason: 'Checkout clears the cart through the private store; useCart already returns clearCart.',
  },
];

export const KNOWN_CYCLES: readonly KnownCycle[] = [];

export const DEFAULT_POLICY: BoundaryPolicy = {
  modules: DOMAIN_MODULES,
  publicEntries: PUBLIC_ENTRIES,
  knownViolations: KNOWN_VIOLATIONS,
  knownCycles: KNOWN_CYCLES,
};

/**
 * Coverage old→new manifest: every file collected by `vitest.config.ts` coverage today and the owner
 * path it moves to (boundaries.md, "Owner helper/type"). A slice that moves a file must keep the new
 * path collected; `null` means the file stays in place.
 */
export const COVERAGE_MANIFEST: Readonly<Record<string, readonly string[] | null>> = {
  'src/shared/hooks/useCanRender3D.ts': ['src/modules/home/hooks/useCanRender3D.ts'],
  'src/shared/hooks/useLocalStorage.ts': null,
  'src/shared/hooks/useMediaQuery.ts': null,
  'src/shared/hooks/usePagination.ts': null,
  'src/shared/lib/api-mocking.ts': ['src/integrations/backend/adapters/browser-bootstrap.ts'],
  'src/shared/lib/cloudinary.ts': null,
  'src/shared/lib/errors/api-error.ts': ['src/integrations/backend/client/api-error.ts'],
  'src/shared/lib/focusRing.ts': ['src/shared/styles/focusRing.ts'],
  'src/shared/lib/hooks/createPersistedListStore.ts': ['src/shared/persistence/createPersistedListStore.ts'],
  'src/shared/lib/hooks/useApiMutation.ts': ['src/shared/queries/useApiMutation.ts'],
  'src/shared/lib/mock-content.ts': ['src/modules/catalog/mock-content.ts'],
  'src/shared/lib/motion.ts': ['src/shared/styles/motion.ts'],
  'src/shared/lib/notification.ts': ['src/shared/feedback/notification.ts'],
  'src/shared/lib/seo.ts': null,
  'src/shared/ui/ErrorState.tsx': ['src/shared/components/ErrorState.tsx'],
  'src/shared/ui/LoadingSpinner.tsx': ['src/shared/components/LoadingSpinner.tsx'],
  'src/shared/ui/PageLoader.tsx': ['src/shared/components/PageLoader.tsx'],
  'src/shared/ui/QueryState.tsx': ['src/shared/components/QueryState.tsx'],
  'src/shared/utils/pagination.ts': ['src/shared/pagination/pagination.ts'],
  'src/shared/utils/utils.ts': ['src/shared/styles/cn.ts', 'src/shared/formatting/currency.ts'],
};

export interface Location {
  unit: string;
  logical: string;
  key: string;
}

type EdgeForm = 'import' | 'reexport' | 'side-effect' | 'dynamic' | 'mock';

export interface Edge {
  file: string;
  line: number;
  specifier: string;
  form: EdgeForm;
  /** Imported names; `default`, or `*` for namespace/dynamic/mock/side-effect access. */
  symbols: string[];
  target: string | null;
  isTest: boolean;
}

export interface Violation {
  rule: 'layer' | 'private' | 'wrong-symbol' | 'namespace' | 'reexport' | 'cycle' | 'unresolved' | 'unregistered-module' | 'stale-exception';
  file: string;
  line: number;
  message: string;
}

const toPosix = (path: string): string => path.split(sep).join('/');
const stripExtension = (path: string): string => path.replace(/\.(tsx?|jsx?|mjs|json)$/, '');
const isTestFile = (path: string): boolean => /\.(test|spec)\.[jt]sx?$/.test(path);

export function locate(file: string): Location {
  const path = toPosix(file);
  const domain = /^src\/(?:features|modules)\/([^/]+)\/(.*)$/.exec(path);
  if (domain && domain[1] !== 'storefront-shell') {
    const [, unit = '', rest = ''] = domain;
    const logical = stripExtension(rest);
    return { unit, logical, key: `${unit}:${logical}` };
  }
  const root = ROOTS.find(({ prefix }) => path.startsWith(prefix));
  const unit = root?.unit ?? 'platform';
  const rest = root ? `${root.logicalPrefix ?? ''}${path.slice(root.prefix.length)}` : path.replace(/^src\//, '');
  const logical = stripExtension(rest);
  return { unit, logical, key: `${unit}:${logical}` };
}

function listSourceFiles(root: string, dir = 'src'): string[] {
  const absolute = join(root, dir);
  if (!existsSync(absolute) || IGNORED_DIRS.has(dir)) return [];
  return readdirSync(absolute).flatMap((name) => {
    const child = `${dir}/${name}`;
    if (statSync(join(root, child)).isDirectory()) return listSourceFiles(root, child);
    const isSource = SOURCE_EXTENSIONS.some((extension) => name.endsWith(extension)) && !name.endsWith('.d.ts');
    return isSource ? [child] : [];
  });
}

function resolveSpecifier(root: string, file: string, specifier: string): string | null | undefined {
  let base: string;
  if (specifier.startsWith('@/')) base = join(root, 'src', specifier.slice(2));
  else if (specifier.startsWith('.')) base = resolve(root, dirname(file), specifier);
  else return undefined; // external package
  for (const suffix of RESOLVE_SUFFIXES) {
    const candidate = `${base}${suffix}`;
    if (existsSync(candidate) && statSync(candidate).isFile()) return toPosix(relative(root, candidate));
  }
  return null;
}

function importedSymbols(clause: ts.ImportClause | undefined): string[] {
  if (!clause) return ['*'];
  const symbols: string[] = [];
  if (clause.name) symbols.push('default');
  const bindings = clause.namedBindings;
  if (bindings && ts.isNamespaceImport(bindings)) symbols.push('*');
  if (bindings && ts.isNamedImports(bindings)) {
    for (const element of bindings.elements) symbols.push((element.propertyName ?? element.name).text);
  }
  return symbols;
}

const MOCK_CALLS = new Set(['mock', 'doMock', 'importActual', 'importMock', 'unmock']);

function isMockCall(node: ts.CallExpression): boolean {
  const callee = node.expression;
  return (
    ts.isPropertyAccessExpression(callee) && ts.isIdentifier(callee.expression) && callee.expression.text === 'vi' && MOCK_CALLS.has(callee.name.text)
  );
}

export function collectEdges(root: string, file: string): Edge[] {
  const text = readFileSync(join(root, file), 'utf8');
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const edges: Edge[] = [];
  const isTest = isTestFile(file);

  const add = (node: ts.Node, specifier: string, form: EdgeForm, symbols: string[]): void => {
    const target = resolveSpecifier(root, file, specifier);
    if (target === undefined) return;
    const line = source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1;
    edges.push({ file, line, specifier, form, symbols, target, isTest });
  };

  const visit = (node: ts.Node): void => {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      const symbols = importedSymbols(node.importClause);
      add(node, node.moduleSpecifier.text, node.importClause ? 'import' : 'side-effect', symbols);
    } else if (ts.isExportDeclaration(node) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
      const clause = node.exportClause;
      const symbols = clause && ts.isNamedExports(clause) ? clause.elements.map((element) => (element.propertyName ?? element.name).text) : ['*'];
      add(node, node.moduleSpecifier.text, 'reexport', symbols);
    } else if (ts.isCallExpression(node) && node.arguments[0] && ts.isStringLiteralLike(node.arguments[0])) {
      if (node.expression.kind === ts.SyntaxKind.ImportKeyword) add(node, node.arguments[0].text, 'dynamic', ['*']);
      else if (isMockCall(node)) add(node, node.arguments[0].text, 'mock', ['*']);
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return edges;
}

function consumerKeys(from: Location): string[] {
  return from.unit === 'app' ? [`app:${from.logical}`] : [from.unit];
}

interface EdgeContext {
  edge: Edge;
  from: Location;
  to: Location;
}

function checkPublicAccess(context: EdgeContext, policy: BoundaryPolicy): Violation | null {
  const { edge, from, to } = context;
  const at = { file: edge.file, line: edge.line };
  if (edge.form === 'reexport') {
    return { ...at, rule: 'reexport', message: `Re-exporting ${to.key} from ${from.unit} widens its public API.` };
  }
  if (edge.symbols.includes('*')) {
    return { ...at, rule: 'namespace', message: `${edge.form} access to ${to.key} bypasses the named-symbol allowlist.` };
  }
  const consumers = consumerKeys(from);
  const entries = policy.publicEntries.filter((entry) => entry.target === to.key && entry.consumers.some((consumer) => consumers.includes(consumer)));
  if (entries.length === 0) {
    return { ...at, rule: 'private', message: `${to.key} is not a public entry for ${consumers.join(', ')}.` };
  }
  const allowed = new Set(entries.flatMap((entry) => entry.symbols));
  const denied = edge.symbols.filter((symbol) => !allowed.has(symbol));
  if (denied.length > 0) {
    return { ...at, rule: 'wrong-symbol', message: `${denied.join(', ')} from ${to.key} is not allowlisted for ${consumers.join(', ')}.` };
  }
  return null;
}

function checkLayer(from: Location, to: Location, edge: Edge): Violation | null {
  const toDomainOrComposition = !COMPOSITION_UNITS.has(to.unit) && !FOUNDATION_UNITS.has(to.unit) && to.unit !== 'testing';
  if (FOUNDATION_UNITS.has(from.unit) && (toDomainOrComposition || COMPOSITION_UNITS.has(to.unit))) {
    return { file: edge.file, line: edge.line, rule: 'layer', message: `${from.unit} must not depend on ${to.unit} (${to.key}).` };
  }
  const fromDomain = !COMPOSITION_UNITS.has(from.unit) && !FOUNDATION_UNITS.has(from.unit) && from.unit !== 'testing';
  if (fromDomain && COMPOSITION_UNITS.has(to.unit)) {
    return { file: edge.file, line: edge.line, rule: 'layer', message: `Module ${from.unit} must not depend on ${to.unit} (${to.key}).` };
  }
  return null;
}

function coversSymbols(known: KnownViolation, edge: Edge): boolean {
  return edge.symbols.every((symbol) => known.symbols.includes(symbol));
}

/** Strongly connected components of size > 1 (Tarjan). */
export function findCycles(graph: ReadonlyMap<string, ReadonlySet<string>>): string[][] {
  let index = 0;
  const indices = new Map<string, number>();
  const lowLinks = new Map<string, number>();
  const stack: string[] = [];
  const onStack = new Set<string>();
  const cycles: string[][] = [];

  const connect = (node: string): void => {
    indices.set(node, index);
    lowLinks.set(node, index);
    index += 1;
    stack.push(node);
    onStack.add(node);
    for (const next of graph.get(node) ?? []) {
      if (!indices.has(next)) {
        connect(next);
        lowLinks.set(node, Math.min(lowLinks.get(node) ?? 0, lowLinks.get(next) ?? 0));
      } else if (onStack.has(next)) {
        lowLinks.set(node, Math.min(lowLinks.get(node) ?? 0, indices.get(next) ?? 0));
      }
    }
    if (lowLinks.get(node) !== indices.get(node)) return;
    const component: string[] = [];
    let member: string | undefined;
    do {
      member = stack.pop();
      if (member === undefined) break;
      onStack.delete(member);
      component.push(member);
    } while (member !== node);
    if (component.length > 1) cycles.push(component.sort());
  };

  for (const node of [...graph.keys()].sort()) if (!indices.has(node)) connect(node);
  return cycles;
}

const sameSet = (left: readonly string[], right: readonly string[]): boolean =>
  left.length === right.length && [...left].sort().every((value, position) => value === [...right].sort()[position]);

export interface CheckResult {
  violations: Violation[];
  edges: number;
  knownInUse: string[];
}

export function checkModuleBoundaries(root: string, policy: BoundaryPolicy = DEFAULT_POLICY): CheckResult {
  const violations: Violation[] = [];
  const usedKnown = new Set<KnownViolation>();
  const moduleGraph = new Map<string, Set<string>>();
  const modules = new Set(policy.modules);
  const files = listSourceFiles(root);
  const reportedModules = new Set<string>();
  let edgeCount = 0;

  for (const file of files) {
    const from = locate(file);
    const fromIsDomain = !COMPOSITION_UNITS.has(from.unit) && !FOUNDATION_UNITS.has(from.unit) && from.unit !== 'testing';
    if (fromIsDomain && !modules.has(from.unit) && !reportedModules.has(from.unit)) {
      reportedModules.add(from.unit);
      violations.push({
        file,
        line: 1,
        rule: 'unregistered-module',
        message: `Module root "${from.unit}" is not registered in the boundary policy.`,
      });
    }
    for (const edge of collectEdges(root, file)) {
      edgeCount += 1;
      if (edge.target === null) {
        violations.push({ file, line: edge.line, rule: 'unresolved', message: `Cannot resolve internal ${edge.form} "${edge.specifier}".` });
        continue;
      }
      const to = locate(edge.target);
      if (to.unit === from.unit) continue;
      const toIsDomain = modules.has(to.unit);
      if (fromIsDomain && toIsDomain && !edge.isTest) {
        const targets = moduleGraph.get(from.unit) ?? new Set<string>();
        targets.add(to.unit);
        moduleGraph.set(from.unit, targets);
      }
      const violation = checkLayer(from, to, edge) ?? (toIsDomain ? checkPublicAccess({ edge, from, to }, policy) : null);
      if (!violation) continue;
      // A snapshotted edge stays in use even if it gains symbols; the extra symbols still fail.
      const known = policy.knownViolations.find((candidate) => candidate.from === from.key && candidate.to === to.key);
      if (known) usedKnown.add(known);
      if (!known || !coversSymbols(known, edge)) violations.push(violation);
    }
  }

  const usedCycles = new Set<KnownCycle>();
  for (const cycle of findCycles(moduleGraph)) {
    const known = policy.knownCycles.find((candidate) => sameSet(candidate.modules, cycle));
    if (known) usedCycles.add(known);
    else violations.push({ file: 'src', line: 0, rule: 'cycle', message: `Module cycle: ${cycle.join(' ↔ ')}.` });
  }

  for (const known of policy.knownViolations) {
    if (!usedKnown.has(known)) {
      violations.push({
        file: 'scripts/check-module-boundaries.ts',
        line: 0,
        rule: 'stale-exception',
        message: `Known violation ${known.from} → ${known.to} no longer exists; remove it.`,
      });
    }
  }
  for (const known of policy.knownCycles) {
    if (!usedCycles.has(known)) {
      violations.push({
        file: 'scripts/check-module-boundaries.ts',
        line: 0,
        rule: 'stale-exception',
        message: `Known cycle ${known.modules.join(' ↔ ')} no longer exists; remove it.`,
      });
    }
  }

  const knownInUse = [
    ...[...usedKnown].map((known) => `${known.from} → ${known.to} (until ${known.removedBy})`),
    ...[...usedCycles].map((known) => `cycle ${known.modules.join(' ↔ ')} (until ${known.removedBy})`),
  ];
  return { violations, edges: edgeCount, knownInUse };
}

export interface CoverageScope {
  include: readonly string[];
  exclude: readonly string[];
}

export function collectCoverageFiles(root: string, scope: CoverageScope): string[] {
  const files = new Set<string>();
  for (const pattern of scope.include) {
    for (const file of globSync(pattern, { cwd: root, exclude: [...scope.exclude] })) files.add(toPosix(file));
  }
  return [...files].sort();
}

export function checkCoverageManifest(
  root: string,
  collected: readonly string[],
  manifest: Readonly<Record<string, readonly string[] | null>> = COVERAGE_MANIFEST,
): string[] {
  const errors: string[] = [];
  const collectedSet = new Set(collected);
  const known = new Set(Object.keys(manifest));
  const targets = new Set(Object.values(manifest).flatMap((value) => value ?? []));

  for (const file of collected) {
    if (!known.has(file) && !targets.has(file)) errors.push(`${file} is collected by coverage but missing from the old→new manifest.`);
  }
  for (const [oldPath, newPaths] of Object.entries(manifest)) {
    if (existsSync(join(root, oldPath))) {
      if (!collectedSet.has(oldPath)) errors.push(`${oldPath} still exists but is no longer collected by coverage.`);
      continue;
    }
    const moved = (newPaths ?? []).filter((path) => existsSync(join(root, path)));
    if (moved.length === 0) errors.push(`${oldPath} is gone and no manifest target exists (${(newPaths ?? []).join(', ') || 'none'}).`);
    for (const path of moved) {
      if (!collectedSet.has(path)) errors.push(`${oldPath} moved to ${path}, which coverage no longer collects.`);
    }
  }
  return errors;
}

async function loadCoverageScope(root: string): Promise<CoverageScope> {
  const module = (await import(pathToFileURL(join(root, 'vitest.config.ts')).href)) as {
    default: { test?: { coverage?: { include?: string[]; exclude?: string[] } } };
  };
  const coverage = module.default.test?.coverage;
  return { include: coverage?.include ?? [], exclude: coverage?.exclude ?? [] };
}

async function main(): Promise<void> {
  const root = process.cwd();
  const result = checkModuleBoundaries(root);
  const coverageErrors = checkCoverageManifest(root, collectCoverageFiles(root, await loadCoverageScope(root)));

  for (const violation of result.violations) console.error(`${violation.file}:${violation.line} [${violation.rule}] ${violation.message}`);
  for (const error of coverageErrors) console.error(`vitest.config.ts [coverage-manifest] ${error}`);
  for (const known of result.knownInUse) console.warn(`known exception: ${known}`);

  if (result.violations.length > 0 || coverageErrors.length > 0) {
    console.error(`Module boundaries: ${result.violations.length + coverageErrors.length} problem(s).`);
    process.exitCode = 1;
    return;
  }
  console.warn(`Module boundaries: ${result.edges} internal edges checked, ${result.knownInUse.length} known exception(s).`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) void main();
