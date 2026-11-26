'use client';

import { useState } from 'react';

import type { SyntheticEvent } from 'react';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface UseNewsletterFormOptions {
  readonly invalidEmailMessage: string;
  readonly onSubmit?: (email: string) => void;
}

/** Owns the newsletter signup form's state/validation/submit — `NewsletterForm` only renders it.
 * `noValidate` on the `<form>` (kept there, it's presentational): we own validation here so the error
 * renders as a styled, consistent inline message instead of the browser's native validation bubble. */
export function useNewsletterForm({ invalidEmailMessage, onSubmit }: UseNewsletterFormOptions) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleEmailChange(value: string): void {
    setEmail(value);
    if (error != null) setError(null);
  }

  function handleSubmit(e: SyntheticEvent<HTMLFormElement>): void {
    e.preventDefault();
    const trimmedEmail = email.trim();

    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      setError(invalidEmailMessage);
      return;
    }

    setError(null);
    onSubmit?.(trimmedEmail);
    setSubmitted(true);
  }

  return { email, setEmail: handleEmailChange, submitted, error, handleSubmit };
}
