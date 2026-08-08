import Link from 'next/link';

import { Mail, Phone } from 'lucide-react';

const UTILITY_GROUPS = [
  {
    heading: 'Mua sắm',
    links: [
      { href: '/products', label: 'Tất cả sản phẩm' },
      { href: '/products?category=sale', label: 'Flash Sale' },
    ],
  },
  {
    heading: 'Tài khoản',
    links: [
      { href: '/auth/login', label: 'Đăng nhập' },
      { href: '/auth/register', label: 'Đăng ký' },
      { href: '/account/orders', label: 'Đơn hàng của tôi' },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="border-border bg-neutral-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-16 lg:px-8">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <p className="font-display text-3xl font-black tracking-tighter md:text-4xl">
              ANTIGRAVITY<span className="text-white/50">.STORE</span>
            </p>
            <p className="mt-3 text-sm text-white/70 md:text-base">
              Hàng ngàn sản phẩm chính hãng, giao hàng nhanh toàn quốc — mua sắm không giới hạn.
            </p>
          </div>

          <div className="flex flex-wrap gap-x-12 gap-y-6">
            {UTILITY_GROUPS.map((group) => (
              <div key={group.heading}>
                <h3 className="text-xs font-semibold tracking-wide text-white/50 uppercase">{group.heading}</h3>
                <ul className="mt-3 space-y-2 text-sm">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="rounded text-white/80 outline-none hover:text-white focus-visible:ring-2 focus-visible:ring-white/70"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div>
              <h3 className="text-xs font-semibold tracking-wide text-white/50 uppercase">Hỗ trợ</h3>
              <ul className="mt-3 space-y-2 text-sm">
                <li className="flex items-center gap-2 text-white/80">
                  <Phone className="size-4 shrink-0" />
                  <span className="tabular-nums">1800 xxxx</span>
                </li>
                <li className="flex items-center gap-2 text-white/80">
                  <Mail className="size-4 shrink-0" />
                  <span>support@antigravity.store</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Antigravity.Store. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
