'use client';

import { useState } from 'react';
import type { SyntheticEvent } from 'react';

import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';

import { useStaffAuth } from '@/core/session/useStaffAuth';

export default function LoginPage(): React.JSX.Element {
  const t = useTranslations('auth');
  const router = useRouter();
  const { login } = useStaffAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
      <form onSubmit={onSubmit} className="bg-card w-full max-w-sm space-y-4 rounded-xl border p-6 shadow-sm">
        <h1 className="text-lg font-black tracking-tight">
          ANTIGRAVITY<span className="text-muted-foreground">.ADMIN</span>
        </h1>
        {error !== null ? (
          <p role="alert" className="text-destructive text-sm">
            {error}
          </p>
        ) : null}
        <div className="space-y-1.5">
          <Label htmlFor="email">{t('email')}</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">{t('password')}</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
          />
        </div>
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? t('loggingIn') : t('login')}
        </Button>
      </form>
    </div>
  );
}
