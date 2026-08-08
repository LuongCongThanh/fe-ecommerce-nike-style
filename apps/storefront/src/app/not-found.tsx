import Link from 'next/link';

import { Button } from '@repo/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <p className="text-brand-600 font-display text-6xl font-black">404</p>
      <h1 className="text-2xl font-bold tracking-tight">Không tìm thấy trang</h1>
      <p className="text-muted-foreground max-w-md text-sm">Trang bạn tìm không tồn tại hoặc đã bị di chuyển.</p>
      <Button asChild>
        <Link href="/vi">Về trang chủ</Link>
      </Button>
    </div>
  );
}
