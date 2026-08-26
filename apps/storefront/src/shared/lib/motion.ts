import type { Transition } from 'framer-motion';

/**
 * Apple's fluid-interface motion vocabulary (WWDC 2018 — *Designing Fluid Interfaces*), mapped onto
 * Motion's spring API so every surface in the app speaks the same physics.
 *
 * Apple replaced the physics triplet (mass/stiffness/damping) with two designer-facing parameters:
 * - **damping ratio** — overshoot. `1.0` = critically damped (no bounce), `< 1.0` = bouncy.
 * - **response** — how quickly the value reaches its target, in seconds. *Not* a duration; a spring
 *   has no fixed duration, its settle time emerges from the parameters.
 *
 * Motion's `bounce` + `visualDuration` are the direct equivalents (`visualDuration` *is* response).
 *
 * House rule: default to the critically-damped springs. Overshoot is only earned when the gesture
 * itself carried momentum (a flick, a throw, a drag release) or when confirming a physical action.
 * Bounce on something that merely faded in reads as noise.
 */

/** Default for anything the user can touch — damping 1.0 / response 0.35. */
export const SPRING_UI: Transition = { type: 'spring', bounce: 0, visualDuration: 0.35 };

/** Repositioning a thing on screen (Apple ships damping 1.0 / response 0.4 for PiP-style moves). */
export const SPRING_MOVE: Transition = { type: 'spring', bounce: 0, visualDuration: 0.4 };

/** Momentum-driven landings only — a flick, a swipe release (damping ~0.8 / response 0.4). */
export const SPRING_MOMENTUM: Transition = { type: 'spring', bounce: 0.2, visualDuration: 0.4 };

/** Drawers / sheets / bars arriving from an edge (damping ~0.8 / response 0.3). */
export const SPRING_SHEET: Transition = { type: 'spring', bounce: 0.2, visualDuration: 0.3 };

/** Reduced-motion equivalent: a short cross-fade instead of a spring — gentle, non-vestibular. */
export const FADE: Transition = { duration: 0.2, ease: 'easeOut' };

/**
 * Where a flick would come to rest, using Apple's exponential-decay projection from the
 * *Designing Fluid Interfaces* sample code — the same function scroll deceleration uses.
 *
 * Snap to the target nearest the **projected** endpoint, not the release point; that is what makes
 * a flick feel like it throws the element rather than nudging it.
 *
 * @param velocity px/s at release.
 * @param decelerationRate 0.998 for a normal scroll feel, 0.99 for a snappier one.
 */
export function projectMomentum(velocity: number, decelerationRate = 0.998): number {
  return ((velocity / 1000) * decelerationRate) / (1 - decelerationRate);
}

/**
 * Progressive resistance past a boundary. A hard stop reads as "frozen"; resistance that grows the
 * further you pull reads as "responsive, but there is nothing more here".
 */
export function rubberband(overshoot: number, dimension: number, constant = 0.55): number {
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));
}
