// Hallmark redesign · design-system: design.md · scope: app page (functional, no enrichment)
'use client';

import { Check } from 'lucide-react';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/Accordion';
import { isMockContentEnabled } from '@/shared/lib/mock-content';

interface ProductDetailTabsProps {
  readonly description: string;
}

const FEATURES = [
  { label: 'Chất liệu', value: 'Cotton 100% cao cấp' },
  { label: 'Xuất xứ', value: 'Việt Nam' },
  { label: 'Bảo quản', value: 'Giặt máy ở nhiệt độ thường, không tẩy' },
  { label: 'Thương hiệu', value: 'Antigravity' },
];

/**
 * `FEATURES` is placeholder content with no verified source — the specs claim a material and country
 * of origin that are identical for every product. It is gated the same way the home testimonials are
 * (see `home/page.tsx`, design.md). Reviews are not shown until slice R adds them to the API.
 */
const SHOW_PLACEHOLDER_CONTENT = isMockContentEnabled();

export function ProductDetailTabs({ description }: ProductDetailTabsProps) {
  return (
    <Accordion type="multiple" defaultValue={['description']} className="w-full">
      <AccordionItem value="description" className="border-b">
        <AccordionTrigger className="hover:text-foreground/80 py-5 text-base font-semibold hover:no-underline">Mô tả sản phẩm</AccordionTrigger>
        <AccordionContent className="pb-6">
          <p className="text-muted-foreground text-base leading-relaxed whitespace-pre-line">{description === '' ? 'Chưa có mô tả.' : description}</p>
          {/* Generic selling points, not facts about this Product — demo builds only. */}
          {SHOW_PLACEHOLDER_CONTENT ? (
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
          ) : null}
        </AccordionContent>
      </AccordionItem>

      {SHOW_PLACEHOLDER_CONTENT ? (
        <AccordionItem value="specs" className="border-b">
          <AccordionTrigger className="hover:text-foreground/80 py-5 text-base font-semibold hover:no-underline">Thông số</AccordionTrigger>
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
      ) : null}
    </Accordion>
  );
}
