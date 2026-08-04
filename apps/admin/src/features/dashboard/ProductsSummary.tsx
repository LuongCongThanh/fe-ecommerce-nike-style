'use client';

import { getProducts } from '@repo/api-sdk/endpoints/catalog';
import type { Product } from '@repo/schemas/catalog';
import { Button } from '@repo/ui/button';
import { useQuery } from '@tanstack/react-query';

/** First real proof the app shell can render a @repo/ui primitive, use a @repo/schemas type, and call a mock endpoint through @repo/api-sdk. */
export function ProductsSummary() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard', 'products-summary'],
    queryFn: () => getProducts(),
  });

  return (
    <section>
      <Button onClick={() => void refetch()}>Refresh</Button>
      {isLoading ? <p>Loading products…</p> : null}
      {isError ? <p role="alert">Failed to load products</p> : null}
      {data ? (
        <ul>
          {data.data.map((product: Product) => (
            <li key={product.id}>{product.name}</li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
