/**
 * Where this app is mounted behind the storefront's microfrontend proxy. Vite's `base`, the router's
 * `basepath` and the MSW worker scope all have to agree; they used to be three separate string
 * literals held together only by comments pointing at each other.
 *
 * The one copy this cannot reach is the proxy's own `routing.paths` in the storefront's
 * `microfrontends.json` — that file is read by Turborepo, not by this bundle.
 */
export const BASE_PATH = '/admin';
