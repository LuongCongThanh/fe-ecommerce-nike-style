import Image from 'next/image';

import { Star } from 'lucide-react';

import { cn } from '@/shared/lib/utils';

interface TestimonialCardProps {
  readonly name: string;
  readonly avatar: string;
  readonly rating: number;
  readonly quote: string;
  readonly meta?: string;
}

function StarRating({ rating }: { readonly rating: number }): React.JSX.Element {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className={cn('size-4', i < Math.min(Math.round(rating), 5) ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted')} />
      ))}
    </div>
  );
}

function AvatarImage({ src, name }: { readonly src: string; readonly name: string }): React.JSX.Element {
  const avatarSrc = src.length > 0 ? src : '/images/avatars/default.jpg';

  return (
    <div className="relative size-10 shrink-0 overflow-hidden rounded-full">
      <Image src={avatarSrc} alt={name} width={40} height={40} className="rounded-full object-cover" />
    </div>
  );
}

export function TestimonialCard({ name, avatar, rating, quote, meta }: TestimonialCardProps): React.JSX.Element {
  return (
    <div className="bg-card text-card-foreground flex flex-col gap-3 rounded-xl border p-5 shadow-sm">
      <StarRating rating={rating} />
      <p className="text-foreground flex-1 text-sm leading-relaxed">&#8220;{quote}&#8221;</p>
      <div className="flex items-center gap-3">
        <AvatarImage src={avatar} name={name} />
        <div className="min-w-0">
          <p className="text-foreground truncate text-sm font-semibold">{name}</p>
          {meta != null && meta.length > 0 ? <p className="text-muted-foreground truncate text-xs">{meta}</p> : null}
        </div>
      </div>
    </div>
  );
}
