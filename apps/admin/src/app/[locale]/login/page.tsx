'use client';

import { useState } from 'react';
import type { SyntheticEvent } from 'react';

import { Button } from '@repo/ui/button';
import { Checkbox } from '@repo/ui/checkbox';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { FacebookMark, GoogleMark, TwitterMark } from '@repo/ui/social-marks';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@repo/ui/tooltip';
import { ArrowLeft, Eye, EyeOff, Loader2, Shirt, Tag } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';

import { useStaffAuth } from '@/core/session';

/** No "pants" icon in lucide-react — hand-built silhouette in the same stroke style (24x24
 * viewBox, currentColor, 2px stroke) so it reads as part of the same icon set. */
function PantsMark({ className, style }: { readonly className?: string; readonly style?: React.CSSProperties }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path d="M6 2h12l1 6-2 14h-4l-1-11-1 11H7L5 8Z" />
    </svg>
  );
}

/** TailAdmin's neutral, icon-only social button (design reference — MIT, see docs/adr/0001), kept
 * disabled + tooltipped like before: admin has no OAuth, a working-looking control would be honest-
 * copy slop. */
function SocialButton({ icon: Icon, label, tooltip }: { readonly icon: React.ComponentType; readonly label: string; readonly tooltip: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="block">
          <button
            type="button"
            disabled
            aria-disabled="true"
            className="inline-flex w-full cursor-not-allowed items-center justify-center gap-3 rounded-lg bg-gray-100 px-7 py-3 text-sm font-normal text-gray-700 opacity-70 dark:bg-white/5 dark:text-white/90"
          >
            <Icon />
            {label}
          </button>
        </span>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
}

export default function LoginPage(): React.JSX.Element {
  const t = useTranslations('auth');
  const router = useRouter();
  const { login } = useStaffAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    login({ email, password })
      .then(() => {
        router.push('/');
      })
      .catch(() => {
        setError(t('invalidCredentials'));
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <TooltipProvider>
      <div className="flex min-h-screen flex-col bg-white lg:flex-row dark:bg-gray-900">
        {/* Form pane */}
        <div className="flex w-full flex-1 flex-col lg:w-1/2">
          <div className="mx-auto w-full max-w-md pt-10">
            <button
              type="button"
              onClick={() => {
                router.back();
              }}
              className="inline-flex cursor-pointer items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <ArrowLeft className="size-4" />
              {t('back')}
            </button>
          </div>

          <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
            <div>
              <div className="mb-5 sm:mb-8">
                <h1 className="text-title-sm sm:text-title-md mb-2 font-semibold text-gray-800 dark:text-white/90">{t('login')}</h1>
              </div>

              {error !== null ? (
                <p role="alert" className="border-destructive/30 bg-destructive/10 text-destructive mb-4 rounded-lg border px-3 py-2 text-sm">
                  {error}
                </p>
              ) : null}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <SocialButton icon={FacebookMark} label="Facebook" tooltip={t('socialUnavailable')} />
                <SocialButton icon={TwitterMark} label="Twitter" tooltip={t('socialUnavailable')} />
                <SocialButton icon={GoogleMark} label="Google" tooltip={t('socialUnavailable')} />
              </div>

              <div className="relative py-3 sm:py-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-800" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white p-2 text-gray-400 sm:px-5 sm:py-2 dark:bg-gray-900">{t('or')}</span>
                </div>
              </div>

              <form onSubmit={onSubmit} className="space-y-5">
                <div>
                  <Label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    {t('email')}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                    }}
                    className="h-11 rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    {t('password')}
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                      }}
                      className="h-11 rounded-lg border-gray-300 pr-11 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setShowPassword((v) => !v);
                      }}
                      aria-label={showPassword ? t('hidePassword') : t('showPassword')}
                      className="absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer text-gray-500 dark:text-gray-400"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="remember-me"
                      checked={rememberMe}
                      onCheckedChange={(checked) => {
                        setRememberMe(checked === true);
                      }}
                    />
                    <Label htmlFor="remember-me" className="text-sm font-normal text-gray-700 dark:text-gray-400">
                      {t('rememberMe')}
                    </Label>
                  </div>

                  {/* No self-registration for staff accounts (SUPER_ADMIN creates them) and no
                   * forgot-password flow yet — disabled + tooltipped rather than a fake working link. */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <button type="button" disabled className="cursor-not-allowed text-sm text-gray-400 underline-offset-4 dark:text-gray-600">
                          {t('forgotPassword')}
                        </button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>{t('socialUnavailable')}</TooltipContent>
                  </Tooltip>
                </div>

                <Button type="submit" disabled={isSubmitting} className="h-11 w-full cursor-pointer rounded-lg">
                  {isSubmitting ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
                  {isSubmitting ? t('loggingIn') : t('login')}
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Decorative pane — hidden below lg so the form is never pushed off-screen on mobile.
         * Brand blue (TailAdmin's palette, admin-only) is the accent here — same "no stock photo,
         * internal tool" reasoning as before, now on the new theme. */}
        <div className="from-brand-900 via-brand-700 to-brand-950 relative hidden overflow-hidden bg-linear-to-br lg:block lg:w-1/2">
          <div className="login-blob bg-brand-400/60 -top-24 -left-24 size-96" />
          <div className="login-blob bg-brand-300/45 top-1/3 -right-20 size-80" style={{ animationDelay: '-6s' }} />
          <div className="login-blob bg-accent-400/35 -bottom-16 left-1/4 size-48" style={{ animationDelay: '-11s' }} />

          <Tag className="login-icon-float top-1/4 left-1/5 size-6 text-white/40" style={{ animationDelay: '-2s' }} aria-hidden="true" />
          <PantsMark className="login-icon-float right-1/5 bottom-1/4 size-7 text-white/35" style={{ animationDelay: '-4.5s' }} />

          <div className="login-scene absolute inset-0 flex items-center justify-center">
            <Shirt className="login-centerpiece size-28 text-white/85 lg:size-32" strokeWidth={1.25} aria-hidden="true" />
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
