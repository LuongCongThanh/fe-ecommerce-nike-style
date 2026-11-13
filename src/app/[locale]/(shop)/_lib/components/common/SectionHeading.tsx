import Link from 'next/link';

import { cn } from '@/shared/lib/utils';

interface SectionHeadingProps {
  readonly title: string;
  readonly subtitle?: string;
  readonly ctaLabel?: string;
  readonly ctaHref?: string;
  readonly align?: 'left' | 'center';
}

export function SectionHeading({ title, subtitle, ctaLabel, ctaHref, align = 'left' }: SectionHeadingProps): React.JSX.Element {
  const isCenter = align === 'center';

  return (
    <div className={cn('flex items-start', isCenter ? 'flex-col items-center text-center' : 'flex-row items-end justify-between')}>
      <div className={cn('flex flex-col gap-1', isCenter && 'items-center')}>
        <h2 className="text-foreground text-2xl font-bold tracking-tight">{title}</h2>
        {subtitle != null && subtitle.length > 0 ? <p className="text-muted-foreground text-sm">{subtitle}</p> : null}
      </div>
      {ctaLabel != null && ctaLabel.length > 0 && ctaHref != null && ctaHref.length > 0 ? (
        <Link href={ctaHref} className={cn('text-primary shrink-0 text-sm font-medium underline-offset-4 hover:underline', isCenter && 'mt-3')}>
          {ctaLabel}
        </Link>
      ) : null}
    </div>
  );
}
