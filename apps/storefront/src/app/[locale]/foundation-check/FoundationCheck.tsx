'use client';

import { useEffect, useState } from 'react';

import { enableApiMockingBrowser } from '@repo/api-sdk/adapters/browser';
import { getProducts } from '@repo/api-sdk/endpoints/catalog';
import type { Product } from '@repo/schemas/catalog';
import { Button } from '@repo/ui/button';
import { useQuery } from '@tanstack/react-query';

/**
 * Not linked from any nav — isolated proof for issue #7 that @repo/ui, @repo/schemas, and
 * @repo/api-sdk work together inside apps/storefront without touching the real app's shell.
 * Boots its own MSW gate rather than the global Providers, so it can't affect any other route.
 */
export function FoundationCheck() {
  const [isMockingReady, setIsMockingReady] = useState(false);

  useEffect(() => {
    enableApiMockingBrowser()
      .then(() => {
        setIsMockingReady(true);
      })
      .catch(() => {
        setIsMockingReady(true);
      });
  }, []);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['foundation-check', 'products'],
    queryFn: async () => getProducts(),
    enabled: isMockingReady,
  });

  return (
    <section>
      <Button onClick={() => void refetch()}>Refresh</Button>
      {isLoading ? <p>Loading products…</p> : null}
      {isError ? <p role="alert">Failed to load products</p> : null}
      {data != null ? (
        <ul>
          {data.data.map((product: Product) => (
            <li key={product.id}>{product.name}</li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
