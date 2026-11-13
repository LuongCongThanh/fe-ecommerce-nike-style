// Formatting only — real linting runs via `pnpm lint` in CI and on demand (eslint needs the
// whole-project type information, so it is not run per staged file).
export default {
  '{src,e2e}/**/*.{ts,tsx,js,mjs,cjs,json,css,md,mdx,yaml,yml}': ['prettier --write'],
  '*.{ts,mjs,json}': ['prettier --write'],
};
