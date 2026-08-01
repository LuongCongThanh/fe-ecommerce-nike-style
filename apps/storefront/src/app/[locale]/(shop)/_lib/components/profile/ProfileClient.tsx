'use client';

import { useEffect } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { useProfile } from '@/app/[locale]/(shop)/_lib/hooks/profile/useProfile';
import { useUpdateProfile } from '@/app/[locale]/(shop)/_lib/hooks/profile/useUpdateProfile';
import type { ProfileInput } from '@/app/[locale]/(shop)/_lib/schemas/profile';
import { profileSchema } from '@/app/[locale]/(shop)/_lib/schemas/profile';
import { Button } from '@/shared/components/base/button';
import { Input } from '@/shared/components/base/input';
import { Label } from '@/shared/components/base/label';

export function ProfileClient(): React.JSX.Element {
  const { data: profile } = useProfile();
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
    <form
      onSubmit={handleSubmit((d) => {
        updateProfile.mutate(d);
      })}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="lastName">Họ</Label>
          <Input id="lastName" {...register('lastName')} />
          {errors.lastName != null ? <p className="text-destructive mt-1 text-sm">{errors.lastName.message}</p> : null}
        </div>
        <div>
          <Label htmlFor="firstName">Tên</Label>
          <Input id="firstName" {...register('firstName')} />
          {errors.firstName != null ? <p className="text-destructive mt-1 text-sm">{errors.firstName.message}</p> : null}
        </div>
      </div>
      <div>
        <Label htmlFor="phone">Số điện thoại</Label>
        <Input id="phone" placeholder="0901234567" {...register('phone')} />
      </div>
      <Button type="submit" disabled={updateProfile.isPending}>
        {updateProfile.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
      </Button>
    </form>
  );
}
