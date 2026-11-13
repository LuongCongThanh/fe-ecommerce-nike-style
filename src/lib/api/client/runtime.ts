export interface AuthRuntimeAdapter {
  getAccessToken(): string | null;
  refreshSession(): Promise<string>;
  onAuthFailure?(error: unknown): void;
}

let runtimeAdapter: AuthRuntimeAdapter | null = null;

export function registerAuthRuntimeAdapter(adapter: AuthRuntimeAdapter): () => void {
  runtimeAdapter = adapter;

  return () => {
    if (runtimeAdapter === adapter) {
      runtimeAdapter = null;
    }
  };
}

export function getAuthRuntimeAdapter(): AuthRuntimeAdapter | null {
  return runtimeAdapter;
}

/** Unconditional clear, unlike the `unregister` returned by `registerAuthRuntimeAdapter` — used by `resetAuthRuntime` for test teardown. */
export function clearAuthRuntimeAdapter(): void {
  runtimeAdapter = null;
}
