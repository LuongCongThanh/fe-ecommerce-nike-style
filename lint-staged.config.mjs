// Formatting only — each workspace package has its own eslint + config
// (different rule sets per app/package), so pre-commit can't safely run a
// single `eslint --fix` across the whole tree. Real linting runs via
// `pnpm lint` (turbo, scoped correctly per package) in CI and on demand.
export default {
  'apps/**/*.{ts,tsx,js,mjs,cjs}': ['prettier --write'],
  'apps/**/*.{json,md,mdx,css,scss,yaml,yml}': ['prettier --write'],
  'packages/**/*.{ts,tsx,js,mjs,cjs}': ['prettier --write'],
  'packages/**/*.{json,md,mdx,css,scss,yaml,yml}': ['prettier --write'],
};
