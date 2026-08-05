'use client';

import { Suspense } from 'react';

import { Environment, OrbitControls, RoundedBox } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';

import { getVariantColorHex } from '@/app/[locale]/(shop)/_lib/utils/variantColor';

interface ProductViewer3DProps {
  /** Currently selected Variant's Color — `null` when the Product has no Color axis (glossary.md — Variant). */
  readonly color: string | null;
}

/**
 * Placeholder 3D product viewer (Decision #59) — a simple rotatable mesh recolored per the selected
 * Variant, since no real per-product 3D asset pipeline exists yet. Only ever mounted through the
 * `next/dynamic({ ssr: false })` wrapper in `ProductInfoPanel`; never import this (or `three`/
 * `@react-three/*`) from a shared route/layout above the PDP — see FE-ARCHITECTURE.md §4.1.1.
 */
export default function ProductViewer3D({ color }: ProductViewer3DProps): React.JSX.Element {
  const hex = getVariantColorHex(color);

  return (
    <div className="bg-muted aspect-square w-full overflow-hidden rounded-xl" data-testid="product-viewer-3d">
      <Canvas camera={{ position: [0, 0, 3.2], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 4, 2]} intensity={1.2} />
        <Suspense fallback={null}>
          <RoundedBox args={[1.6, 1.6, 1.6]} radius={0.18} smoothness={4}>
            <meshStandardMaterial color={hex} roughness={0.4} metalness={0.1} />
          </RoundedBox>
          <Environment preset="city" />
        </Suspense>
        <OrbitControls autoRotate autoRotateSpeed={2.5} enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  );
}
