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
    <Link href={href} className="group block">
      <div className="flex flex-col gap-2">
        <div className="relative aspect-square overflow-hidden rounded-xl">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        </div>
        <div className="px-0.5">
          <p className="text-foreground text-sm font-semibold">{name}</p>
          {productCount !== undefined && (
            <p className="text-muted-foreground mt-1 text-xs">
              {productCount.toLocaleString('vi-VN')} {countLabel ?? 'sản phẩm'}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
