'use client';

import { Button } from '@repo/ui/button';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

import { useNewsletterForm } from '@/app/[locale]/(shop)/_lib/hooks/home/useNewsletterForm';

interface NewsletterFormProps {
  readonly title?: string;
  readonly description?: string;
  readonly submitLabel?: string;
  readonly emailLabel?: string;
  readonly placeholder?: string;
  readonly invalidEmailMessage?: string;
  readonly successTitle?: string;
  readonly successDescription?: string;
  readonly onSubmit?: (email: string) => void;
}

const INVALID_EMAIL_MESSAGE = 'Vui lòng nhập một địa chỉ email hợp lệ.';

export function NewsletterForm({
  title,
  description,
  submitLabel = 'Đăng ký',
  emailLabel = 'Địa chỉ email',
  placeholder = 'Nhập email của bạn',
  invalidEmailMessage = INVALID_EMAIL_MESSAGE,
  successTitle = 'Đăng ký thành công!',
  successDescription = 'Cảm ơn bạn đã đăng ký nhận tin.',
  onSubmit,
}: NewsletterFormProps): React.JSX.Element {
  const { email, setEmail, submitted, error, handleSubmit } = useNewsletterForm({ invalidEmailMessage, onSubmit });
  const prefersReducedMotion = useReducedMotion() === true;

  const transition = prefersReducedMotion ? { duration: 0 } : { duration: 0.2, ease: [0, 0, 0.2, 1] as const };
  const successInitial = prefersReducedMotion ? false : { opacity: 0, transform: 'translateY(8px)' };
  const formExit = prefersReducedMotion ? { opacity: 0 } : { opacity: 0, transform: 'translateY(-8px)' };

  return (
    <motion.div layout={!prefersReducedMotion} className="overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        {submitted ? (
          <motion.div
            key="success"
            initial={successInitial}
            animate={{ opacity: 1, transform: 'translateY(0px)' }}
            transition={transition}
            className="bg-primary/10 text-primary rounded-xl px-6 py-8 text-center"
          >
            <p className="text-base font-semibold">{successTitle}</p>
            <p className="text-muted-foreground mt-1 text-sm">{successDescription}</p>
          </motion.div>
        ) : (
          <motion.div key="form" initial={false} exit={formExit} transition={transition} className="flex flex-col gap-4">
            {title != null && title.length > 0 ? <h3 className="text-foreground text-lg font-bold">{title}</h3> : null}
            {description != null && description.length > 0 ? <p className="text-muted-foreground text-sm">{description}</p> : null}
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-2 sm:flex-row sm:items-start">
              <div className="min-w-0 flex-1">
                <input
                  aria-label={emailLabel}
                  aria-invalid={error != null}
                  aria-describedby={error != null ? 'newsletter-email-error' : undefined}
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                  }}
                  placeholder={placeholder}
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
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
