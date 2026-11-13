'use client';

// Hallmark redesign · design-system: design.md · scope: app page (functional, no enrichment)
import { useTranslations } from 'next-intl';

import { useProfileForm } from '@/features/account/profile/hooks/useProfileForm';
import { Button } from '@/shared/ui/Button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/Form';
import { Input } from '@/shared/ui/Input';
import { QueryState } from '@/shared/ui/QueryState';

export function ProfileClient(): React.JSX.Element {
  const t = useTranslations('common');
  const tProfile = useTranslations('profile');
  const { form, onSubmit, isLoading, isError, refetch, isSaving } = useProfileForm();

  return (
    <QueryState
      isLoading={isLoading}
      error={isError ? new Error(tProfile('loadError')) : null}
      onRetry={() => {
        refetch().catch(() => {
          /* error state already surfaced via isError */
        });
      }}
      loadingLabel={t('loading')}
      errorTitle={tProfile('loadError')}
      errorFallbackDescription={t('errorDescription')}
      retryLabel={t('retry')}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="bg-card space-y-5 rounded-xl border p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Họ</FormLabel>
                  <FormControl>
                    <Input autoComplete="family-name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên</FormLabel>
                  <FormControl>
                    <Input autoComplete="given-name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Số điện thoại</FormLabel>
                <FormControl>
                  <Input placeholder="0901234567" autoComplete="tel" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </form>
      </Form>
    </QueryState>
  );
}
