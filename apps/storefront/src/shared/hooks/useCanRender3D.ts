'use client';

import { useEffect, useState } from 'react';

/**
 * `'off'` — this device/session never gets WebGL; stay on the 2D carousel forever.
 * `'pending'` — still deciding, or waiting for an idle slot. Render 2D, load nothing.
 * `'ready'` — every gate passed; the caller may load the three.js chunk.
 */
export type Render3DStatus = 'off' | 'pending' | 'ready';

/**
 * `'full'` — desktop-class: dissolve + idle warp + pointer warp, device pixel ratio up to 2.
 * `'lite'` — touch/small screens: dissolve only, no idle, no pointer, dpr capped at 1.5, and the
 * render loop is expected to sleep between transitions.
 */
export type Render3DTier = 'full' | 'lite';

export interface CanRender3D {
  readonly status: Render3DStatus;
  readonly tier: Render3DTier;
}

/** Bail out of idle-waiting on slow machines so the enhancement is not deferred forever. */
const IDLE_TIMEOUT_MS = 2_000;

/** Below this we assume a phone-class GPU regardless of what the viewport reports. */
const MIN_DEVICE_MEMORY_GB = 4;
const MIN_LOGICAL_CORES = 4;

/** Viewports narrower than this get the `'lite'` tier (matches the `lg` breakpoint). */
const LITE_TIER_MAX_WIDTH_PX = 1024;

interface NetworkInformationLike {
  readonly saveData?: boolean;
  readonly effectiveType?: string;
}

interface NavigatorWith3DHints extends Navigator {
  readonly connection?: NetworkInformationLike;
  readonly deviceMemory?: number;
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function isConstrainedNetwork(nav: NavigatorWith3DHints): boolean {
  const connection = nav.connection;
  if (connection === undefined) return false;
  if (connection.saveData === true) return true;

  return connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g';
}

function isConstrainedHardware(nav: NavigatorWith3DHints): boolean {
  const memory = nav.deviceMemory;
  if (memory !== undefined && memory < MIN_DEVICE_MEMORY_GB) return true;

  const cores = nav.hardwareConcurrency;
  return typeof cores === 'number' && cores < MIN_LOGICAL_CORES;
}

/**
 * Probe for a real WebGL2 context rather than trusting `'WebGL2RenderingContext' in window` — the
 * constructor exists on machines whose driver is blocklisted and `getContext` still returns `null`.
 */
function supportsWebGL2(): boolean {
  const probe = document.createElement('canvas');
  try {
    return probe.getContext('webgl2') !== null;
  } catch {
    return false;
  } finally {
    probe.width = 0;
    probe.height = 0;
  }
}

function resolveTier(): Render3DTier {
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
  return coarsePointer || window.innerWidth < LITE_TIER_MAX_WIDTH_PX ? 'lite' : 'full';
}

/** Schedule `run` for an idle slot, falling back to a timer where `requestIdleCallback` is absent. */
function scheduleIdle(run: () => void): () => void {
  if (typeof window.requestIdleCallback === 'function') {
    const handle = window.requestIdleCallback(run, { timeout: IDLE_TIMEOUT_MS });
    return () => {
      window.cancelIdleCallback(handle);
    };
  }

  const handle = window.setTimeout(run, IDLE_TIMEOUT_MS);
  return () => {
    window.clearTimeout(handle);
  };
}

/**
 * Decides whether this session may load the three.js hero enhancement, and at what quality.
 *
 * Gates run in cost order and any failure is terminal — a session that starts on a metered
 * connection is never re-evaluated, because flipping the hero to WebGL mid-visit is more jarring
 * than never showing it. `'ready'` is only reported from an idle callback, so the three.js chunk
 * can never compete with the hero image for the LCP window.
 */
export function useCanRender3D(): CanRender3D {
  const [state, setState] = useState<CanRender3D>({ status: 'pending', tier: 'full' });

  useEffect(
    () =>
      // Every gate — the WebGL probe included — is evaluated inside the idle slot, so nothing here
      // touches the GPU or the compositor while the hero image is still competing for the LCP.
      scheduleIdle(() => {
        const nav = navigator as NavigatorWith3DHints;

        if (prefersReducedMotion() || isConstrainedNetwork(nav) || isConstrainedHardware(nav) || !supportsWebGL2()) {
          setState({ status: 'off', tier: 'full' });
          return;
        }

        setState({ status: 'ready', tier: resolveTier() });
      }),
    [],
  );

  return state;
}
