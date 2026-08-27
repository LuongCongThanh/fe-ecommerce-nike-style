'use client';

// Hallmark · synced with apps/admin's Split Studio login (design.md § Variants) — same macrostructure
// and shared login.css mechanics, own trust-blue accent + content-management centerpiece motif.
import { useState } from 'react';
import type { SyntheticEvent } from 'react';

import { Button } from '@repo/ui/button';
import { Checkbox } from '@repo/ui/checkbox';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@repo/ui/tooltip';
import { Eye, EyeOff, ImageIcon, Loader2, Lock, Mail, Newspaper, PenLine, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';

import { useStaffAuth } from '@/core/session';

/** Minimal single-colour brand marks — good enough for a disabled/decorative button, not claiming
 * pixel-exact Simple Icons fidelity. See the "Chưa hỗ trợ" tooltip: these 3 don't do anything yet.
 * Kept identical to apps/admin's — same disabled-social-row motif, per the cross-app login sync. */
function FacebookMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden="true">
      <path d="M9.1 23.7v-8H6.6v-3.7h2.5V10.4c0-4.1 1.8-6 5.9-6 .8 0 2 .1 2.6.3v3.3a17 17 0 0 0-1.4 0c-1.7 0-2.4.7-2.4 2.3v1.7h3.9l-.7 3.7H13.7v8A11.96 11.96 0 0 0 24 12 12 12 0 1 0 9.1 23.7Z" />
    </svg>
  );
}

function TwitterMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden="true">
      <path d="M24 4.6a9.9 9.9 0 0 1-2.8.8 4.9 4.9 0 0 0 2.2-2.7 9.9 9.9 0 0 1-3.1 1.2A4.9 4.9 0 0 0 11.9 9c0 .4 0 .8.1 1.1A13.9 13.9 0 0 1 1.7 5.1a4.9 4.9 0 0 0 1.5 6.5A4.8 4.8 0 0 1 1 11v.1a4.9 4.9 0 0 0 3.9 4.8 4.9 4.9 0 0 1-2.2.1 4.9 4.9 0 0 0 4.6 3.4A9.9 9.9 0 0 1 0 21.5a13.9 13.9 0 0 0 7.6 2.2c9 0 14-7.5 14-14v-.6A9.9 9.9 0 0 0 24 4.6Z" />
    </svg>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden="true">
      <path d="M12.5 10.2v3.8h5.5c-.7 2.3-2.6 4-5.5 4a6 6 0 1 1 3.9-10.6l2.8-2.8A10 10 0 1 0 22 12l-9.5-1.8Z" />
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
           * design.md § Variants: unlike admin's login, this stays on the system's normal accent
           * scope — --color-secondary (trust blue), not brand red. Centerpiece swapped from admin's
           * apparel motif to a content-management one (Newspaper + floating pen/image icons). */}
          <div className="from-secondary-900 via-secondary-700 to-secondary-950 relative hidden overflow-hidden bg-linear-to-br md:block">
            <div className="login-blob bg-secondary-400/60 -top-24 -left-24 size-96" />
            <div className="login-blob bg-secondary-300/45 top-1/3 -right-20 size-80" style={{ animationDelay: '-6s' }} />
            <div className="login-blob bg-accent-400/35 -bottom-16 left-1/4 size-48" style={{ animationDelay: '-11s' }} />

            <PenLine className="login-icon-float top-1/4 left-1/5 size-6 text-white/40" style={{ animationDelay: '-2s' }} aria-hidden="true" />
            <ImageIcon
              className="login-icon-float right-1/5 bottom-1/4 size-7 text-white/35"
              style={{ animationDelay: '-4.5s' }}
              aria-hidden="true"
            />

            <div className="login-scene absolute inset-0 flex items-center justify-center">
              <Newspaper className="login-centerpiece size-28 text-white/85 lg:size-32" strokeWidth={1.25} aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
