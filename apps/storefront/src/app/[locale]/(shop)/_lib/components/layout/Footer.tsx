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
    // Statement close instead of the generic "columns of links + tiny copyright" template
    // (homepage-improvement-plan.md P2-1) — the brand statement leads on its own, the utility
    // links + contact info sit in one row below a divider instead of competing as equal-weight
    // columns beside it. Same links/content as before, just re-weighted.
    <footer className="bg-surface-inverse text-surface-inverse-foreground">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20 lg:px-8">
        <p className="font-display max-w-3xl min-w-0 text-4xl font-black tracking-tighter [overflow-wrap:anywhere] sm:text-5xl md:text-6xl">
          ANTIGRAVITY<span className="text-white/40">.STORE</span>
        </p>
        <p className="mt-4 max-w-md text-sm text-white/70 md:text-base">
          Hàng ngàn sản phẩm chính hãng, giao hàng nhanh toàn quốc — mua sắm không giới hạn.
        </p>

        <div className="mt-12 flex flex-col gap-8 border-t border-white/10 pt-8 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between md:mt-16 md:pt-10">
          <nav aria-label="Liên kết footer" className="flex flex-wrap gap-x-10 gap-y-6">
            {UTILITY_GROUPS.map((group) => (
              <div key={group.heading}>
                <h3 className="text-xs font-semibold tracking-wide text-white/50 uppercase">{group.heading}</h3>
                <ul className="mt-3 space-y-2 text-sm">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="rounded text-white/80 transition-colors duration-(--duration-fast) outline-none hover:text-white focus-visible:ring-2 focus-visible:ring-white/70"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

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

        <div className="mt-10 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Antigravity.Store. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
