import { NewsletterForm } from '@/app/[locale]/(shop)/_lib/components/home/NewsletterForm';

export function SectionNewsletter(): React.JSX.Element {
  return (
    <section className="bg-neutral-900 text-white">
      <div className="container mx-auto flex flex-col items-center gap-6 px-4 py-14 text-center md:py-20">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Nhận ưu đãi độc quyền</h2>
          <p className="text-sm text-neutral-400 md:text-base">Đăng ký nhận bản tin để không bỏ lỡ khuyến mãi và flash sale mỗi ngày</p>
        </div>
        <div className="w-full max-w-md">
          <NewsletterForm submitLabel="Đăng ký ngay" />
        </div>
      </div>
    </section>
  );
}
