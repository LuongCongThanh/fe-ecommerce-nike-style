'use client';

// Hallmark redesign · design-system: design.md · scope: app page (functional, no enrichment)
import { QueryState } from '@repo/shared/query-state';
import { Button } from '@repo/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@repo/ui/form';
import { Input } from '@repo/ui/input';

import { useProfileForm } from '@/app/[locale]/(shop)/_lib/hooks/profile/useProfileForm';

export function ProfileClient(): React.JSX.Element {
  const { form, onSubmit, isLoading, isError, refetch, isSaving } = useProfileForm();

  return (
    <QueryState
      isLoading={isLoading}
      error={isError ? new Error('Không thể tải thông tin hồ sơ') : null}
      onRetry={() => {
        refetch().catch(() => {
          /* error state already surfaced via isError */
        });
      }}
      errorTitle="Không thể tải thông tin hồ sơ"
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
