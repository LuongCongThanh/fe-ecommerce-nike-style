import Link from 'next/link';

import { Mail, Phone } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-border bg-muted border-t">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <span className="text-foreground text-xl font-extrabold tracking-tight">
              SHOP<span className="text-muted-foreground">.VN</span>
            </span>
            <p className="text-muted-foreground mt-2 text-sm">Mua sắm trực tuyến nhanh chóng, tiện lợi.</p>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-foreground mb-3 text-sm font-semibold">Mua sắm</h3>
            <ul className="text-muted-foreground space-y-2 text-sm">
              <li>
                <Link href="/products" className="hover:text-foreground">
                  Tất cả sản phẩm
                </Link>
              </li>
              <li>
                <Link href="/products?category=sale" className="hover:text-foreground">
                  Flash Sale
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-foreground mb-3 text-sm font-semibold">Tài khoản</h3>
            <ul className="text-muted-foreground space-y-2 text-sm">
              <li>
                <Link href="/auth/login" className="hover:text-foreground">
                  Đăng nhập
                </Link>
              </li>
              <li>
                <Link href="/auth/register" className="hover:text-foreground">
                  Đăng ký
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-foreground">
                  Đơn hàng của tôi
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-foreground mb-3 text-sm font-semibold">Hỗ trợ</h3>
            <ul className="text-muted-foreground space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Phone className="size-4" />
                <span>1800 xxxx</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="size-4" />
                <span>support@shop.vn</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-border text-muted-foreground mt-8 border-t pt-6 text-center text-xs">
          © {new Date().getFullYear()} Shop.VN. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
