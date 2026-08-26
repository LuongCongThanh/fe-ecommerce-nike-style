'use client';

// Hallmark redesign · design-system: design.md · scope: app page (functional, no enrichment)
import { useEffect } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { QueryState } from '@repo/shared/query-state';
import { Button } from '@repo/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@repo/ui/form';
import { Input } from '@repo/ui/input';
import { useForm } from 'react-hook-form';

import { useProfile } from '@/app/[locale]/(shop)/_lib/hooks/profile/useProfile';
import { useUpdateProfile } from '@/app/[locale]/(shop)/_lib/hooks/profile/useUpdateProfile';
import type { ProfileInput } from '@/app/[locale]/(shop)/_lib/schemas/profile';
import { profileSchema } from '@/app/[locale]/(shop)/_lib/schemas/profile';

export function ProfileClient(): React.JSX.Element {
  const { data: profile, isLoading, isError, refetch } = useProfile();
  const updateProfile = useUpdateProfile();

  const form = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (profile != null) {
      form.reset({ firstName: profile.firstName, lastName: profile.lastName, phone: profile.phone ?? '' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `form.reset` is stable; re-running per `profile` is the intent.
  }, [profile]);

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
        <form
          onSubmit={form.handleSubmit((d) => {
            updateProfile.mutate(d);
          })}
          className="bg-card space-y-5 rounded-xl border p-6"
        >
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
          <Button type="submit" disabled={updateProfile.isPending}>
            {updateProfile.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </form>
      </Form>
    </QueryState>
  );
}
