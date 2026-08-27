'use client';

import { useState } from 'react';
import type { SyntheticEvent } from 'react';

import { Button } from '@repo/ui/button';
import { Checkbox } from '@repo/ui/checkbox';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { FacebookMark, GoogleMark, TwitterMark } from '@repo/ui/social-marks';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@repo/ui/tooltip';
import { Eye, EyeOff, Loader2, Lock, Mail, Shirt, Tag, X } from 'lucide-react';
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
      <div className="bg-muted flex min-h-screen items-center justify-center p-4">
        <div className="login-rise bg-card grid w-full max-w-4xl overflow-hidden rounded-2xl shadow-xl md:grid-cols-2">
          {/* Form pane */}
          <div className="relative flex flex-col justify-center p-6 sm:p-10">
            <button
              type="button"
              onClick={() => {
                router.back();
              }}
              aria-label={t('back')}
              className="text-muted-foreground hover:text-foreground hover:bg-accent absolute top-4 left-4 cursor-pointer rounded-full p-1.5 transition-colors"
            >
              <X className="size-4" />
            </button>

            <div className="mx-auto w-full max-w-sm space-y-5 pt-6">
              <h1 className="text-3xl font-bold tracking-tight">{t('login')}</h1>

              {error !== null ? (
                <p role="alert" className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-3 py-2 text-sm">
                  {error}
                </p>
              ) : null}

              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">{t('email')}</Label>
                  <div className="relative">
                    <Mail className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                      }}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password">{t('password')}</Label>
                  <div className="relative">
                    <Lock className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                      }}
                      className="px-9"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setShowPassword((v) => !v);
                      }}
                      aria-label={showPassword ? t('hidePassword') : t('showPassword')}
                      className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 size-4 -translate-y-1/2 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="remember-me"
                    checked={rememberMe}
                    onCheckedChange={(checked) => {
                      setRememberMe(checked === true);
                    }}
                  />
                  <Label htmlFor="remember-me" className="text-muted-foreground font-normal">
                    {t('rememberMe')}
                  </Label>
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full cursor-pointer">
                  {isSubmitting ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
                  {isSubmitting ? t('loggingIn') : t('login')}
                </Button>

                {/* No self-registration for staff accounts (SUPER_ADMIN creates them) and no
                 * forgot-password flow yet — this link is disabled + tooltipped rather than a fake
                 * working link, same treatment as the social buttons below. */}
                <div className="flex justify-end text-sm">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <button type="button" disabled className="text-muted-foreground/60 cursor-not-allowed underline-offset-4">
                          {t('forgotPassword')}
                        </button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>{t('socialUnavailable')}</TooltipContent>
                  </Tooltip>
                </div>
              </form>

              <div className="relative py-1 text-center text-xs">
                <span className="border-border absolute top-1/2 left-0 w-full border-t" />
                <span className="bg-card text-muted-foreground relative px-2 uppercase">{t('or')}</span>
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
                          {t('loginWith', { provider: label })}
                        </button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>{t('socialUnavailable')}</TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>
          </div>

          {/* Decorative pane — hidden below md so the form is never pushed off-screen on mobile.
           * design.md § Variants: brand red-orange stays the accent here (user-approved exception).
           * No stock photo: this is an internal admin tool with no relevant photography to show. */}
          <div className="from-brand-900 via-brand-700 to-brand-950 relative hidden overflow-hidden bg-linear-to-br md:block">
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
      </div>
    </TooltipProvider>
  );
}
