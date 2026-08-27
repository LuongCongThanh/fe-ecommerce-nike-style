'use client';

// Hallmark · synced with apps/admin's Split Studio login (design.md § Variants) — same macrostructure
// and shared login.css mechanics; storefront keeps its real register/forgot-password links (no
// staff-only restrictions) and its own react-hook-form LoginForm for validation + submit.
import { Suspense } from 'react';
import { useRouter } from 'next/navigation';

import { LoadingSpinner } from '@repo/shared/loading-spinner';
import { FacebookMark, GoogleMark, TwitterMark } from '@repo/ui/social-marks';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@repo/ui/tooltip';
import { Heart, Package, ShoppingBag, X } from 'lucide-react';

import { LoginForm } from '@/app/[locale]/(auth)/_lib/components/LoginForm';

export default function LoginPage(): React.JSX.Element {
  const router = useRouter();

  return (
    <TooltipProvider>
      <div className="login-rise bg-card grid w-full max-w-4xl overflow-hidden rounded-2xl shadow-xl md:grid-cols-2">
        {/* Form pane */}
        <div className="relative flex flex-col justify-center p-6 sm:p-10">
          <button
            type="button"
            onClick={() => {
              router.back();
            }}
            aria-label="Quay lại"
            className="text-muted-foreground hover:text-foreground hover:bg-accent absolute top-4 left-4 cursor-pointer rounded-full p-1.5 transition-colors"
          >
            <X className="size-4" />
          </button>

          <div className="mx-auto w-full max-w-sm space-y-5 pt-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold tracking-tight">Đăng nhập</h1>
              <p className="text-muted-foreground mt-2 text-sm">Chào mừng trở lại!</p>
            </div>

            <Suspense fallback={<LoadingSpinner size="lg" label="Đang tải biểu mẫu đăng nhập" className="w-full justify-center py-10" />}>
              <LoginForm />
            </Suspense>

            <div className="relative py-1 text-center text-xs">
              <span className="border-border absolute top-1/2 left-0 w-full border-t" />
              <span className="bg-card text-muted-foreground relative px-2 uppercase">hoặc</span>
            </div>

            <div className="space-y-2">
              {(
                [
                  { key: 'facebook', label: 'Facebook', Icon: FacebookMark, className: 'login-social-facebook' },
                  { key: 'twitter', label: 'Twitter', Icon: TwitterMark, className: 'login-social-twitter' },
                  { key: 'google', label: 'Google', Icon: GoogleMark, className: 'login-social-google' },
                ] as const
              ).map(({ key, label, Icon, className }) => (
                <Tooltip key={key}>
                  <TooltipTrigger asChild>
                    <span className="block">
                      <button
                        type="button"
                        disabled
                        aria-disabled="true"
                        className={`inline-flex h-10 w-full cursor-not-allowed items-center justify-center gap-2 rounded-md text-sm font-medium text-white opacity-70 ${className}`}
                      >
                        <Icon />
                        Đăng nhập với {label}
                      </button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>Chưa hỗ trợ</TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
        </div>

        {/* Decorative pane — hidden below md so the form is never pushed off-screen on mobile.
         * design.md § Variants: storefront stays off the brand-red-as-chrome exception too (that's
         * admin-only) — this reuses `--color-surface-inverse`, the same dark treatment storefront's
         * own Hero/Newsletter/Footer already share, so the login page reads as this app's own brand,
         * not a borrowed accent. Centerpiece is a ShoppingBag (retail context) + floating heart/
         * package icons, same login.css motion vocabulary as admin/cms. */}
        <div className="bg-surface-inverse relative hidden overflow-hidden md:block">
          <div className="login-blob -top-24 -left-24 size-96 bg-neutral-700/50" />
          <div className="login-blob top-1/3 -right-20 size-80 bg-neutral-600/40" style={{ animationDelay: '-6s' }} />
          <div className="login-blob bg-accent-500/25 -bottom-16 left-1/4 size-48" style={{ animationDelay: '-11s' }} />

          <Heart className="login-icon-float top-1/4 left-1/5 size-6 text-white/40" style={{ animationDelay: '-2s' }} aria-hidden="true" />
          <Package className="login-icon-float right-1/5 bottom-1/4 size-7 text-white/35" style={{ animationDelay: '-4.5s' }} aria-hidden="true" />

          <div className="login-scene absolute inset-0 flex items-center justify-center">
            <ShoppingBag className="login-centerpiece size-28 text-white/85 lg:size-32" strokeWidth={1.25} aria-hidden="true" />
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
