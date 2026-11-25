// Types for eslint.boundaries.mjs so scripts and tests import the zones without `any`.
export interface RestrictedPathZone {
  readonly target: string | readonly string[];
  readonly from: string | readonly string[];
  readonly message: string;
}

export interface BoundaryElement {
  readonly type: string;
  readonly pattern: string | readonly string[];
  readonly capture?: readonly string[];
}

export declare const DOMAIN_MODULES: readonly string[];
export declare const restrictedPathZones: readonly RestrictedPathZone[];
export declare const boundaryElements: readonly BoundaryElement[];
