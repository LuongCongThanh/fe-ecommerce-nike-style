'use client';

import { useState } from 'react';

import { Button } from '@repo/ui/button';

interface NewsletterFormProps {
  readonly title?: string;
  readonly description?: string;
  readonly submitLabel?: string;
  readonly onSubmit?: (email: string) => void;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INVALID_EMAIL_MESSAGE = 'Vui lòng nhập một địa chỉ email hợp lệ.';

export function NewsletterForm({ title, description, submitLabel = 'Đăng ký', onSubmit }: NewsletterFormProps): React.JSX.Element {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // noValidate: we own validation below so the error renders as a styled, consistent inline
  // message instead of the browser's native (and cross-browser-inconsistent) validation bubble
  // (homepage-improvement-plan.md P1-5). `type="email"`/`required` stay on the input as a
  // semantic/no-JS baseline.
  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const trimmedEmail = email.trim();

    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      setError(INVALID_EMAIL_MESSAGE);
      return;
    }

    setError(null);
    onSubmit?.(trimmedEmail);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="bg-primary/10 text-primary rounded-xl px-6 py-8 text-center">
        <p className="text-base font-semibold">Đăng ký thành công!</p>
        <p className="text-muted-foreground mt-1 text-sm">Cảm ơn bạn đã đăng ký nhận tin.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {title != null && title.length > 0 ? <h3 className="text-foreground text-lg font-bold">{title}</h3> : null}
      {description != null && description.length > 0 ? <p className="text-muted-foreground text-sm">{description}</p> : null}
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-2 sm:flex-row sm:items-start">
        <div className="min-w-0 flex-1">
          <input
            aria-label="Địa chỉ email"
            aria-invalid={error != null}
            aria-describedby={error != null ? 'newsletter-email-error' : undefined}
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error != null) setError(null);
            }}
            placeholder="Nhập email của bạn"
            className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring aria-invalid:border-destructive w-full min-w-0 rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
          />
          {error != null ? (
            <p id="newsletter-email-error" role="alert" className="text-destructive mt-1.5 text-sm">
              {error}
            </p>
          ) : null}
        </div>
        <Button type="submit">{submitLabel}</Button>
      </form>
    </div>
  );
}
