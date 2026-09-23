'use client';

import * as React from 'react';

import { Toaster as SonnerToaster, type ToasterProps } from 'sonner';

/** Toast host — mount once per app (root layout), matching the `sonner` popularized shadcn/ui setup.
 * `theme` isn't read from `next-themes` here (packages/ui has no such dependency; not every consumer
 * app uses it) — callers pass their own resolved theme in, defaulting to 'system'. */
function Toaster({ theme = 'system', ...props }: ToasterProps) {
  return (
    <SonnerToaster
      theme={theme}
      className="toaster group [&_div[data-content]]:w-full"
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
        } as React.CSSProperties
      }
      {...props}
    />
  );
}

export { Toaster };
