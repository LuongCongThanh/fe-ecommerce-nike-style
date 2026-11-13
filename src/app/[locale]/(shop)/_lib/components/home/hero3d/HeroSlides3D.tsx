'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useTheme } from 'next-themes';
import type { IUniform, Mesh, Texture } from 'three';
import { Color, DataTexture, LinearFilter, ShaderMaterial, SRGBColorSpace, TextureLoader, Vector2 } from 'three';

import { readTokenColor } from '@/app/[locale]/(shop)/_lib/components/home/hero3d/cssColor';
import { HERO_DISSOLVE_FRAGMENT, HERO_DISSOLVE_VERTEX } from '@/app/[locale]/(shop)/_lib/components/home/hero3d/dissolveShader';
import type { Render3DTier } from '@/shared/hooks/useCanRender3D';

/** Matches the DOM carousel's slide change so the overlay text and the dissolve land together. */
const TRANSITION_MS = 900;
const POINTER_EASING = 0.08;
const FALLBACK_ASPECT = 1;

export interface HeroSlides3DProps {
  /** Fully-resolved image URLs, index-aligned with the DOM carousel's slides. */
  readonly sources: readonly string[];
  readonly activeIndex: number;
  readonly tier: Render3DTier;
  /** Fired on the frame after the active slide is first painted — the parent hides the DOM image then. */
  readonly onReady: () => void;
  /** Fired when the GPU takes the context away; the parent falls back to 2D for good. */
  readonly onContextLost: () => void;
}

interface LoadedTexture {
  readonly texture: Texture;
  readonly aspect: number;
}

/**
 * Where the wake is heading, written by the parent's `pointermove` listener. The easing towards it
 * lives in the scene, so this stays a read-only signal as far as `DissolvePlane` is concerned.
 */
interface PointerTarget {
  position: Vector2;
  strength: number;
}

/**
 * A sampler that is left unbound fails `VALIDATE_STATUS` and the whole program silently renders
 * black, so both slots start on a 1x1 transparent texture rather than `null`.
 */
function createPlaceholderTexture(): DataTexture {
  const texture = new DataTexture(new Uint8Array([0, 0, 0, 0]), 1, 1);
  texture.needsUpdate = true;
  return texture;
}

/** Uniform bag for one dissolve material. Owned by a ref, never by React state. */
interface DissolveUniforms {
  [uniform: string]: IUniform;
  uTexA: { value: Texture };
  uTexB: { value: Texture };
  uProgress: { value: number };
  uTime: { value: number };
  uPlaneAspect: { value: number };
  uAspectA: { value: number };
  uAspectB: { value: number };
  uPointer: { value: Vector2 };
  uPointerStrength: { value: number };
  uIdle: { value: number };
  uEdgeColor: { value: Color };
}

function createUniforms(tier: Render3DTier, placeholder: Texture): DissolveUniforms {
  return {
    uTexA: { value: placeholder },
    uTexB: { value: placeholder },
    uProgress: { value: 0 },
    uTime: { value: 0 },
    uPlaneAspect: { value: 1 },
    uAspectA: { value: FALLBACK_ASPECT },
    uAspectB: { value: FALLBACK_ASPECT },
    uPointer: { value: new Vector2(0.5, 0.5) },
    uPointerStrength: { value: 0 },
    uIdle: { value: tier === 'full' ? 1 : 0 },
    uEdgeColor: { value: new Color('#ffffff') },
  };
}

async function loadTexture(source: string): Promise<LoadedTexture> {
  return new Promise((resolve, reject) => {
    new TextureLoader().load(
      source,
      (texture) => {
        texture.colorSpace = SRGBColorSpace;
        texture.minFilter = LinearFilter;
        texture.generateMipmaps = false;
        const { width, height } = texture.image as { width: number; height: number };
        resolve({ texture, aspect: height === 0 ? FALLBACK_ASPECT : width / height });
      },
      undefined,
      reject,
    );
  });
}

interface DissolvePlaneProps extends Pick<HeroSlides3DProps, 'sources' | 'activeIndex' | 'tier' | 'onReady'> {
  readonly pointer: React.RefObject<PointerTarget | null>;
}

function DissolvePlane({ sources, activeIndex, tier, onReady, pointer }: DissolvePlaneProps): React.JSX.Element {
  const { viewport, invalidate } = useThree();
  const { resolvedTheme } = useTheme();

  const meshRef = useRef<Mesh>(null);
  const uniformsRef = useRef<DissolveUniforms>(null);
  const texturesRef = useRef<Map<number, LoadedTexture>>(null);
  const transitionStart = useRef<number | null>(null);
  const hasHandedOver = useRef(false);
  /** Until a decoded slide lands, both samplers still point at the placeholder. */
  const hasRealTexture = useRef(false);
  const easedPointer = useRef(new Vector2(0.5, 0.5));
  const easedStrength = useRef(0);
  /** Bumped whenever a texture finishes decoding, so the transition effect can re-check. */
  const [textureRevision, setTextureRevision] = useState(0);

  // The material is built here rather than as JSX because three snapshots a material's uniform list
  // when it first links the program — handing the reconciler a `<shaderMaterial>` and assigning
  // `uniforms` afterwards links a program whose samplers are never bound, which fails validation and
  // renders black. Building it imperatively means the uniforms exist before the first link.
  useLayoutEffect(() => {
    const placeholder = createPlaceholderTexture();
    const uniforms = createUniforms(tier, placeholder);
    const material = new ShaderMaterial({
      vertexShader: HERO_DISSOLVE_VERTEX,
      fragmentShader: HERO_DISSOLVE_FRAGMENT,
      uniforms,
    });

    uniformsRef.current = uniforms;
    const mesh = meshRef.current;
    if (mesh !== null) mesh.material = material;

    return () => {
      material.dispose();
      placeholder.dispose();
    };
  }, [tier]);

  // Design tokens are the single source of truth for the dissolve glow, re-read whenever the theme flips.
  useEffect(() => {
    const uniforms = uniformsRef.current;
    if (uniforms === null) return;

    uniforms.uEdgeColor.value = readTokenColor('--color-brand-500', '#ff4d3d');
    invalidate();
  }, [resolvedTheme, invalidate]);

  // The active slide is fetched first; the rest follow only once it is on screen, so the enhancement
  // never competes with the hero image for bandwidth.
  useEffect(() => {
    texturesRef.current ??= new Map<number, LoadedTexture>();
    const loaded = texturesRef.current;
    let isCancelled = false;

    const ingest = async (index: number): Promise<void> => {
      const source = sources[index];
      if (source === undefined || loaded.has(index)) return;

      try {
        const texture = await loadTexture(source);
        if (isCancelled) {
          texture.texture.dispose();
          return;
        }
        loaded.set(index, texture);
        setTextureRevision((revision) => revision + 1);
        invalidate();
      } catch {
        // A slide that will not decode simply never dissolves; the DOM carousel still advances.
      }
    };

    const ingestAll = async (): Promise<void> => {
      await ingest(activeIndex);
      if (isCancelled) return;
      await Promise.all(sources.map(async (_source, index) => ingest(index)));
    };

    ingestAll().catch(() => undefined);

    return () => {
      isCancelled = true;
    };
  }, [sources, activeIndex, invalidate]);

  // Start a dissolve once the incoming slide's texture exists; until then the outgoing slide holds.
  useEffect(() => {
    const uniforms = uniformsRef.current;
    const incoming = texturesRef.current?.get(activeIndex);
    if (uniforms === null || incoming === undefined) return;

    const outgoing = uniforms.uTexB.value;

    if (!hasRealTexture.current) {
      hasRealTexture.current = true;
      uniforms.uTexA.value = incoming.texture;
      uniforms.uTexB.value = incoming.texture;
      uniforms.uAspectA.value = incoming.aspect;
      uniforms.uAspectB.value = incoming.aspect;
      uniforms.uProgress.value = 1;
    } else if (outgoing !== incoming.texture) {
      uniforms.uTexA.value = outgoing;
      uniforms.uAspectA.value = uniforms.uAspectB.value;
      uniforms.uTexB.value = incoming.texture;
      uniforms.uAspectB.value = incoming.aspect;
      uniforms.uProgress.value = 0;
      transitionStart.current = performance.now();
    }

    invalidate();
  }, [activeIndex, textureRevision, invalidate]);

  useEffect(
    () => () => {
      for (const { texture } of texturesRef.current?.values() ?? []) texture.dispose();
      texturesRef.current?.clear();
    },
    [],
  );

  useFrame((state) => {
    const uniforms = uniformsRef.current;
    if (uniforms === null) return;

    uniforms.uTime.value = state.clock.elapsedTime;
    uniforms.uPlaneAspect.value = viewport.width / viewport.height;

    if (transitionStart.current !== null) {
      const elapsed = performance.now() - transitionStart.current;
      const progress = Math.min(elapsed / TRANSITION_MS, 1);
      uniforms.uProgress.value = progress;
      if (progress >= 1) transitionStart.current = null;
      invalidate();
    }

    const wake = pointer.current;
    if (tier === 'full' && wake !== null) {
      easedPointer.current.lerp(wake.position, POINTER_EASING);
      easedStrength.current += (wake.strength - easedStrength.current) * POINTER_EASING;
      uniforms.uPointer.value.copy(easedPointer.current);
      uniforms.uPointerStrength.value = easedStrength.current;
    }

    if (!hasHandedOver.current && hasRealTexture.current) {
      hasHandedOver.current = true;
      requestAnimationFrame(onReady);
    }
  });

  return (
    <mesh ref={meshRef} scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
    </mesh>
  );
}

/**
 * WebGL layer that paints the hero slides while the DOM carousel keeps owning links, focus and
 * autoplay (docs/FRONTEND-GUIDE.md §27). Never import this directly — `HeroCarousel` loads it through
 * `next/dynamic({ ssr: false })` behind `useCanRender3D`.
 */
export default function HeroSlides3D({ sources, activeIndex, tier, onReady, onContextLost }: HeroSlides3DProps): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const pointer = useRef<PointerTarget | null>(null);

  // Never burn GPU on a backgrounded tab or a hero the reader has scrolled past.
  useEffect(() => {
    const container = containerRef.current;
    if (container === null) return;

    let isVisible = !document.hidden;
    let isOnScreen = true;
    const sync = (): void => {
      setIsPaused(!isVisible || !isOnScreen);
    };

    const onVisibilityChange = (): void => {
      isVisible = !document.hidden;
      sync();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    const observer = new IntersectionObserver(
      ([entry]) => {
        isOnScreen = entry?.isIntersecting ?? true;
        sync();
      },
      { threshold: 0 },
    );
    observer.observe(container);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      observer.disconnect();
    };
  }, []);

  // The canvas sits under a `pointer-events-none` layer, so the wake is tracked from the window and
  // projected into the container's own box rather than through raycasting.
  useEffect(() => {
    if (tier !== 'full') return;

    const onPointerMove = (event: PointerEvent): void => {
      const bounds = containerRef.current?.getBoundingClientRect();
      if (bounds === undefined) return;

      const x = (event.clientX - bounds.left) / bounds.width;
      const y = 1 - (event.clientY - bounds.top) / bounds.height;
      const isInside = x >= 0 && x <= 1 && y >= 0 && y <= 1;

      pointer.current ??= { position: new Vector2(0.5, 0.5), strength: 0 };
      pointer.current.position.set(x, y);
      pointer.current.strength = isInside ? 1 : 0;
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
    };
  }, [tier]);

  const handleCreated = useCallback(
    ({ gl }: { gl: { domElement: HTMLCanvasElement } }): void => {
      gl.domElement.addEventListener(
        'webglcontextlost',
        (event) => {
          event.preventDefault();
          onContextLost();
        },
        { once: true },
      );
    },
    [onContextLost],
  );

  const demandOrAlways = tier === 'lite' ? 'demand' : 'always';
  const frameloop = isPaused ? 'never' : demandOrAlways;

  return (
    <div ref={containerRef} aria-hidden="true" data-testid="hero-slides-3d" className="pointer-events-none absolute inset-0">
      <Canvas
        orthographic
        frameloop={frameloop}
        dpr={tier === 'lite' ? [1, 1.5] : [1, 2]}
        gl={{ antialias: false, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 1], zoom: 1 }}
        onCreated={handleCreated}
      >
        <DissolvePlane sources={sources} activeIndex={activeIndex} tier={tier} onReady={onReady} pointer={pointer} />
      </Canvas>
    </div>
  );
}
