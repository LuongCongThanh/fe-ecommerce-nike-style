import Image from 'next/image';
import Link from 'next/link';

interface CategoryCardProps {
  readonly name: string;
  readonly image: string;
  readonly productCount?: number;
  readonly href: string;
  readonly countLabel?: string;
}

export function CategoryCard({ name, image, productCount, href, countLabel }: CategoryCardProps): React.JSX.Element {
  return (
    <Link href={href} className="group focus-visible:ring-ring block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-offset-2">
      <div className="flex flex-col gap-2">
        <div className="group-hover:border-foreground/30 relative aspect-square overflow-hidden rounded-xl border border-transparent transition-colors duration-(--duration-normal) ease-out">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover transition-transform duration-(--duration-normal) ease-out group-hover:-translate-y-0.5"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        </div>
        <div className="px-0.5">
          <p className="text-foreground text-sm font-semibold">{name}</p>
          {productCount !== undefined && (
            <p className="text-muted-foreground mt-1 text-xs tabular-nums">
              {productCount.toLocaleString('en-US')} {countLabel ?? 'products'}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
