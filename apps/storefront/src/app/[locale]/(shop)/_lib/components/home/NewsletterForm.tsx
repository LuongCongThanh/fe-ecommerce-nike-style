'use client';

import { useState } from 'react';

import { Button } from '@/shared/components/base/button';

interface NewsletterFormProps {
  readonly title?: string;
  readonly description?: string;
  readonly submitLabel?: string;
  readonly onSubmit?: (email: string) => void;
}

export function NewsletterForm({ title, description, submitLabel = 'Đăng ký', onSubmit }: NewsletterFormProps): React.JSX.Element {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>): void => {
    e.preventDefault();
    onSubmit?.(email);
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
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
        <input
          aria-label="Địa chỉ email"
          type="email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
          }}
          placeholder="Nhập email của bạn"
          className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring min-w-0 flex-1 rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
        />
        <Button type="submit">{submitLabel}</Button>
      </form>
    </div>
  );
}
