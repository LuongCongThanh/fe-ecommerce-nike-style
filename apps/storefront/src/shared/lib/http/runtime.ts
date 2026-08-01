export interface HttpRuntimeAdapter {
  getAccessToken: () => string | null;
  refreshAccessToken: () => Promise<string>;
  onRefreshFailure?: (error: unknown) => void;
}

let runtimeAdapter: HttpRuntimeAdapter | null = null;

export function registerHttpRuntimeAdapter(adapter: HttpRuntimeAdapter): () => void {
  runtimeAdapter = adapter;

  return () => {
    if (runtimeAdapter === adapter) {
      runtimeAdapter = null;
    }
  };
}

export function getHttpRuntimeAdapter(): HttpRuntimeAdapter | null {
  return runtimeAdapter;
}
