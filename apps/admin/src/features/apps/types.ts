/** Demo-only — ported from shadcn-admin's "App Integrations" grid. No backend integration registry
 * exists, so `connected` is a local, per-browser toggle (see `useAppsState`), not a real connection. */
export interface AppIntegration {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly connected: boolean;
}
