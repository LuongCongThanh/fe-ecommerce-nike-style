// Path-level layer rules for the Storefront (task 35, old roots removed by task 44). Symbol allowlist, module cycles and the
// exact snapshot of known violations live in scripts/check-module-boundaries.ts.

export const DOMAIN_MODULES = ['account', 'auth', 'cart', 'catalog', 'checkout', 'home', 'orders', 'wishlist'];

const domainModuleRoots = DOMAIN_MODULES.map((name) => `./src/modules/${name}/**/*`);

/** App routes, layouts and providers. */
const compositionRoots = ['./src/app/**/*', './src/layouts/**/*', './src/providers/**/*'];

const foundationRoots = ['./src/shared/**/*', './src/integrations/**/*'];

/** Zones for `import/no-restricted-paths`: `target` is the importing file, `from` the imported one. */
export const restrictedPathZones = [
  {
    target: foundationRoots,
    from: ['./src/modules/**/*', ...compositionRoots],
    message: 'Shared and integration code cannot depend on app, layouts, providers or domain modules.',
  },
  {
    target: domainModuleRoots,
    from: compositionRoots,
    message: 'Domain modules cannot depend on app, layouts or providers; composition flows from app/layouts down to modules.',
  },
  {
    target: './src/shared/constants/**/*',
    from: ['./src/shared/components/**/*', './src/shared/hooks/**/*', './src/shared/lib/**/*'],
    message: 'Shared constants must stay foundational and cannot depend on UI, hooks, or lib code.',
  },
  {
    target: './src/shared/types/**/*',
    from: ['./src/shared/components/**/*', './src/shared/hooks/**/*', './src/shared/lib/**/*'],
    message: 'Shared types must remain dependency-light and cannot import UI, hooks, or lib code.',
  },
  {
    target: './src/shared/hooks/**/*',
    from: './src/shared/components/**/*',
    message: 'Hooks must not depend on shared UI components.',
  },
  {
    target: './src/shared/lib/**/*',
    from: './src/shared/components/**/*',
    message: 'Shared lib code must not depend on shared UI components.',
  },
  {
    target: './src/shared/components/base/**/*',
    from: './src/shared/components/common/**/*',
    message: 'Base UI primitives cannot depend on higher-level shared components.',
  },
];

/** `boundaries/elements` for route-group isolation and the auth session element. */
export const boundaryElements = [
  {
    type: 'app-feature',
    // capture[0] = locale segment, capture[1] = route group name e.g. (shop), (auth)
    pattern: 'src/app/*/(*)/**',
    capture: ['_locale', 'group'],
  },
  { type: 'shared', pattern: 'src/shared/**' },
  { type: 'core-session', pattern: 'src/modules/auth/session/**' },
];
