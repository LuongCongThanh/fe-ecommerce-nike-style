'use client';

import { Check, Star } from 'lucide-react';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/shared/components/base/accordion';
import { cn } from '@/shared/lib/utils';

interface Review {
  id: number;
  author: string;
  rating: number;
  date: string;
  comment: string;
}

interface ProductDetailTabsProps {
  readonly description: string;
  readonly rating: number;
  readonly reviewCount: number;
}

const MOCK_REVIEWS: Review[] = [
  {
    id: 1,
    author: 'Nguyễn Văn A',
    rating: 5,
    date: '15/04/2025',
    comment: 'Sản phẩm chất lượng rất tốt, đúng mô tả, giao hàng nhanh. Mình rất hài lòng!',
  },
  {
    id: 2,
    author: 'Trần Thị B',
    rating: 4,
    date: '10/04/2025',
    comment: 'Hàng đẹp, chất vải tốt. Sẽ mua lại lần sau.',
  },
  {
    id: 3,
    author: 'Lê Minh C',
    rating: 5,
    date: '02/04/2025',
    comment: 'Mua cho cả nhà, ai cũng thích. Shop đóng gói cẩn thận.',
  },
];

const FEATURES = [
  { label: 'Chất liệu', value: 'Cotton 100% cao cấp' },
  { label: 'Xuất xứ', value: 'Việt Nam' },
  { label: 'Bảo quản', value: 'Giặt máy ở nhiệt độ thường, không tẩy' },
  { label: 'Thương hiệu', value: 'Antigravity' },
];

export function ProductDetailTabs({ description, rating, reviewCount }: ProductDetailTabsProps) {
  return (
    <Accordion type="multiple" defaultValue={['description']} className="w-full">
      <AccordionItem value="description" className="border-b">
        <AccordionTrigger className="py-5 text-base font-semibold hover:no-underline">Mô tả sản phẩm</AccordionTrigger>
        <AccordionContent className="pb-6">
          <p className="text-muted-foreground text-base leading-relaxed">{description}</p>
          <ul className="text-muted-foreground mt-4 space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Check className="text-success-700 size-4 shrink-0" />
              Chất liệu cao cấp, bền đẹp theo thời gian
            </li>
            <li className="flex items-center gap-2">
              <Check className="text-success-700 size-4 shrink-0" />
              Thiết kế thời thượng, phù hợp mọi dịp
            </li>
            <li className="flex items-center gap-2">
              <Check className="text-success-700 size-4 shrink-0" />
              Thoáng mát, thoải mái khi mặc suốt ngày dài
            </li>
            <li className="flex items-center gap-2">
              <Check className="text-success-700 size-4 shrink-0" />
              Form chuẩn, đa dạng size từ S đến XL
            </li>
          </ul>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="specs" className="border-b">
        <AccordionTrigger className="py-5 text-base font-semibold hover:no-underline">Thông số</AccordionTrigger>
        <AccordionContent className="pb-6">
          <div className="divide-y rounded-xl border">
            {FEATURES.map((f) => (
              <div key={f.label} className="flex px-5 py-3.5 text-sm">
                <span className="text-muted-foreground w-36 shrink-0 font-semibold">{f.label}</span>
                <span className="text-foreground">{f.value}</span>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="reviews" className="border-b">
        <AccordionTrigger className="py-5 text-base font-semibold hover:no-underline">Đánh giá ({reviewCount})</AccordionTrigger>
        <AccordionContent className="pb-6">
          <div className="mb-6 flex items-center gap-6">
            <div className="text-center">
              <p className="text-5xl font-black">{rating.toFixed(1)}</p>
              <div className="mt-1 flex justify-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={`avg-star-${i.toString()}`}
                    className={cn('size-4', i < Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-neutral-300')}
                  />
                ))}
              </div>
              <p className="text-muted-foreground mt-1 text-xs">{reviewCount} đánh giá</p>
            </div>
            <div className="flex-1 space-y-1">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground w-3">{star}</span>
                  <Star className="size-3 fill-amber-400 text-amber-400" />
                  <div className="bg-muted h-1.5 flex-1 overflow-hidden rounded-full">
                    <div className="h-full rounded-full bg-amber-400" style={{ width: star >= 4 ? `${(star === 5 ? 60 : 30).toString()}%` : '5%' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {MOCK_REVIEWS.map((review) => (
              <div key={review.id} className="bg-card rounded-xl border p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{review.author}</p>
                    <div className="mt-1 flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={`review-${review.id.toString()}-star-${i.toString()}`}
                          className={cn('size-3.5', i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-300')}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-muted-foreground text-xs">{review.date}</span>
                </div>
                <p className="text-muted-foreground mt-2 text-sm">{review.comment}</p>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
