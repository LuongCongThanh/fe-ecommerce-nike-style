# 003 — Crossfade NewsletterForm between form and success states

- **Status**: DONE
- **Commit**: 30961c2
- **Severity**: MEDIUM
- **Category**: Missed opportunities (state-change teleport)
- **Estimated scope**: 1 file (`NewsletterForm.tsx`)

## Problem

`NewsletterForm` swaps instantly between its form view and its success view — an early `return` on `submitted` renders a completely different subtree with no transition, so the layout jumps the instant the user submits.

Current code, `apps/storefront/src/app/[locale]/(shop)/_lib/components/home/NewsletterForm.tsx:55-95`:

```tsx
if (submitted) {
  return (
    <div className="bg-primary/10 text-primary rounded-xl px-6 py-8 text-center">
      <p className="text-base font-semibold">{successTitle}</p>
      <p className="text-muted-foreground mt-1 text-sm">{successDescription}</p>
    </div>
  );
}

return (
  <div className="flex flex-col gap-4">
    {title != null && title.length > 0 ? <h3 className="text-foreground text-lg font-bold">{title}</h3> : null}
    {description != null && description.length > 0 ? <p className="text-muted-foreground text-sm">{description}</p> : null}
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-2 sm:flex-row sm:items-start">
      {/* ...input + submit button... */}
    </form>
  </div>
);
```

This is a full, non-reversible state swap (once submitted, the form is gone), triggered rarely (once per visitor at most) — this is the exact "state change that teleports" case AUDIT.md's missed-opportunities category calls out, and it's a "Occasional" frequency element per AUDIT.md's table, so a standard (not delight-tier) transition is the right budget.

## Target

Wrap both states in `AnimatePresence mode="wait"` so the outgoing view fades out before the incoming one fades in, with a `layout` animation on the container so the height change (form → shorter/taller success block) resizes smoothly instead of jumping. Durations/easing come from this repo's own tokens (`packages/tailwind-config/src/theme.css:135,138`, mirrored in `design.md`): `--ease-out: cubic-bezier(0, 0, 0.2, 1)` and `--duration-normal: 200ms` — this is a small in-place UI feedback transition, matching AUDIT.md's "Tooltips, small popovers: 125–200ms" budget, not a marketing-length one.

```tsx
/* target — apps/storefront/src/app/[locale]/(shop)/_lib/components/home/NewsletterForm.tsx */
'use client';

import { useState } from 'react';

import { Button } from '@repo/ui/button';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

// ...unchanged props/constants/handleSubmit...

export function NewsletterForm({} /* ...unchanged props... */ : NewsletterFormProps): React.JSX.Element {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion() === true;

  // ...unchanged handleSubmit...

  return (
    <motion.div layout={!prefersReducedMotion} className="overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        {submitted ? (
          <motion.div
            key="success"
            initial={prefersReducedMotion ? false : { opacity: 0, transform: 'translateY(8px)' }}
            animate={{ opacity: 1, transform: 'translateY(0px)' }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2, ease: [0, 0, 0.2, 1] }}
            className="bg-primary/10 text-primary rounded-xl px-6 py-8 text-center"
          >
            <p className="text-base font-semibold">{successTitle}</p>
            <p className="text-muted-foreground mt-1 text-sm">{successDescription}</p>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={false}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, transform: 'translateY(-8px)' }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2, ease: [0, 0, 0.2, 1] }}
            className="flex flex-col gap-4"
          >
            {title != null && title.length > 0 ? <h3 className="text-foreground text-lg font-bold">{title}</h3> : null}
            {description != null && description.length > 0 ? <p className="text-muted-foreground text-sm">{description}</p> : null}
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-2 sm:flex-row sm:items-start">
              {/* ...input + submit button, unchanged... */}
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
```

Notes on the target:

- `key="success"` / `key="form"` are required — `AnimatePresence` needs stable, distinct keys to know these are two different elements being swapped, not one element re-rendering.
- The `form` variant has no `initial` animation (`initial={false}`) — it's the default state on first mount, so it should not fade in on page load; only its `exit` (when the user submits) needs to animate.
- `motion.div layout` on the outer wrapper uses Framer Motion's FLIP-based layout animation (a `transform`, not an animated `height`), so the container resize itself stays on `transform`/`opacity` per AUDIT.md's performance rule — do not animate `height` directly.
- The inline error message (`NewsletterForm.tsx:85-89`) is out of scope for this plan — it toggles within the same `form` view, not a full state swap, and is not part of this finding.

## Repo conventions to follow

- Reduced motion: branch on `useReducedMotion() === true` exactly like `SectionHero.tsx:27` and `HeroCarousel.tsx:27` — this file is already `'use client'` (`NewsletterForm.tsx:1`), no boundary change needed.
- Easing/duration as inline values (`[0, 0, 0.2, 1]`, `0.2`) — this matches how `SectionHero.tsx:29` and `HeroCarousel.tsx:83` already inline the same curve; do not invent a different easing for this transition.

## Steps

1. In `apps/storefront/src/app/[locale]/(shop)/_lib/components/home/NewsletterForm.tsx`, add `AnimatePresence`, `motion`, `useReducedMotion` to the `framer-motion` import (new import line; the package is already a dependency).
2. Add `const prefersReducedMotion = useReducedMotion() === true;` alongside the existing `useState` calls at the top of the component body.
3. Replace the `if (submitted) { return (...); }` early return and the trailing `return (<div className="flex flex-col gap-4">...</div>);` with the single `AnimatePresence`-wrapped return shown in Target — both the success block and the form block become `motion.div` children with the `key`, `initial`/`animate`/`exit`/`transition` props shown, keeping their existing inner JSX (title/description/form/input/button) unchanged.
4. Wrap the whole `AnimatePresence` in the outer `<motion.div layout={!prefersReducedMotion} className="overflow-hidden">` shown in Target, replacing the two separate top-level `<div>` returns.

## Boundaries

- Do NOT change `handleSubmit`, the email validation regex, or any prop (`title`, `description`, `submitLabel`, etc.) — only the render/return structure and the two new imports/hook call.
- Do NOT touch the inline validation error UI (`NewsletterForm.tsx:85-89`) — out of scope for this finding.
- Do NOT touch `SectionNewsletter.tsx` — it only passes props through and needs no change.
- Do NOT add a new dependency — `framer-motion` is already installed.
- If the component's state structure (the `submitted`/`error` `useState` calls, or the early-return shape) has changed since commit `30961c2`, STOP and report instead of improvising around the drift.

## Verification

- **Mechanical**: `pnpm --filter storefront typecheck` and `pnpm --filter storefront lint` both pass with no new errors. `pnpm --filter storefront test NewsletterForm` (the existing `__tests__/NewsletterForm.test.tsx`) still passes — if it asserts on the exact DOM shape of the success/form states, update the query but not the assertions' intent.
- **Feel check**: load the home page, scroll to the newsletter section, type a valid email, submit:
  - The form fades out and slides up slightly (~8px) while the success message fades in from slightly below — no instant swap, no visible layout jump.
  - The container's height change (form block → success block) resizes smoothly, not abruptly.
  - In DevTools Animations panel, set playback to 10% and confirm the exit and enter animations are ~200ms each with an ease-out feel (fast start, slow finish), not linear.
  - Toggle `prefers-reduced-motion` (Rendering panel), reload, and repeat: the swap happens instantly with no movement, but the state change itself still works correctly.
- **Done when**: submitting a valid email crossfades from form to success state with no teleport, reduced motion collapses it to an instant (but still correct) swap, and the existing test suite passes.
