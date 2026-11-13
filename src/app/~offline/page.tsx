import Link from 'next/link';

export const metadata = {
  title: 'Offline',
};

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-orange-50 px-6 py-16">
      <section className="w-full max-w-lg rounded-3xl border border-orange-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold tracking-[0.2em] text-orange-600 uppercase">Offline</p>
        <h1 className="mt-3 text-3xl font-semibold text-zinc-900">Bạn đang ngoại tuyến</h1>
        <p className="mt-4 text-sm leading-6 text-zinc-600">
          Kết nối mạng đang tạm thời không khả dụng. Bạn có thể thử lại khi online hoặc quay về trang chủ để tiếp tục các nội dung đã được cache.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/vi"
            className="inline-flex h-11 items-center justify-center rounded-full bg-orange-600 px-5 text-sm font-medium text-white transition-colors hover:bg-orange-700"
          >
            Về trang chủ
          </Link>
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-full border border-orange-200 px-5 text-sm font-medium text-orange-700 transition-colors hover:bg-orange-50"
          >
            Thử lại
          </Link>
        </div>
      </section>
    </main>
  );
}
