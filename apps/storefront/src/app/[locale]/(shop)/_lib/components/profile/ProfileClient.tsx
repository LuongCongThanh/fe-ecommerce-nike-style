'use client';

import { useEffect } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { QueryState } from '@repo/shared/query-state';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { useForm } from 'react-hook-form';

import { useProfile } from '@/app/[locale]/(shop)/_lib/hooks/profile/useProfile';
import { useUpdateProfile } from '@/app/[locale]/(shop)/_lib/hooks/profile/useUpdateProfile';
import type { ProfileInput } from '@/app/[locale]/(shop)/_lib/schemas/profile';
import { profileSchema } from '@/app/[locale]/(shop)/_lib/schemas/profile';

export function ProfileClient(): React.JSX.Element {
  const { data: profile, isLoading, isError, refetch } = useProfile();
  const updateProfile = useUpdateProfile();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (profile != null) {
      reset({ firstName: profile.firstName, lastName: profile.lastName, phone: profile.phone ?? '' });
    }
  }, [profile, reset]);

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
      <form
        onSubmit={handleSubmit((d) => {
          updateProfile.mutate(d);
        })}
        className="space-y-4"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="lastName">Họ</Label>
            <Input id="lastName" autoComplete="family-name" {...register('lastName')} />
            {errors.lastName != null ? <p className="text-destructive mt-1 text-sm">{errors.lastName.message}</p> : null}
          </div>
          <div>
            <Label htmlFor="firstName">Tên</Label>
            <Input id="firstName" autoComplete="given-name" {...register('firstName')} />
            {errors.firstName != null ? <p className="text-destructive mt-1 text-sm">{errors.firstName.message}</p> : null}
          </div>
        </div>
        <div>
          <Label htmlFor="phone">Số điện thoại</Label>
          <Input id="phone" placeholder="0901234567" autoComplete="tel" {...register('phone')} />
        </div>
        <Button type="submit" disabled={updateProfile.isPending}>
          {updateProfile.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
        </Button>
      </form>
    </QueryState>
  );
}
