import type { HTMLAttributes } from 'react';

import { cn } from '../lib/cn';

export function Section({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <section className={cn('py-8 md:py-12', className)} {...props} />;
}
