'use client';

import { useState } from 'react';
import type { SyntheticEvent } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';

import { useStaffAuth } from '@/core/session/useStaffAuth';

export default function LoginPage(): React.JSX.Element {
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
        setError('Email hoặc mật khẩu không đúng.');
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
      <form onSubmit={onSubmit} className="bg-card w-full max-w-sm space-y-4 rounded-xl border p-6 shadow-sm">
        <h1 className="text-lg font-black tracking-tight">
          ANTIGRAVITY<span className="text-muted-foreground">.CMS</span>
        </h1>
        {error !== null ? (
          <p role="alert" className="text-destructive text-sm">
            {error}
          </p>
        ) : null}
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
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
          <Label htmlFor="password">Mật khẩu</Label>
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
          {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </Button>
      </form>
    </div>
  );
}
