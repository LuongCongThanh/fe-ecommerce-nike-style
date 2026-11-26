'use client';

import { useEffect } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { useProfile } from '@/modules/account/profile/queries/useProfile';
import { useUpdateProfile } from '@/modules/account/profile/queries/useUpdateProfile';
import type { ProfileInput } from '@/modules/account/profile/schemas/profile.schema';
import { profileSchema } from '@/modules/account/profile/schemas/profile.schema';

/**
 * Owns the profile form's whole lifecycle — fetch, prefill-on-load, validate, submit — so
 * `ProfileClient` only renders. Previously the `useForm` setup and the "reset the form once `profile`
 * loads" effect lived directly in the component.
 */
export function useProfileForm() {
  const { data: profile, isLoading, isError, refetch } = useProfile();
  const updateProfile = useUpdateProfile();

  const form = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: { firstName: '', lastName: '', phone: '' },
  });

  useEffect(() => {
    if (profile != null) {
      form.reset({ firstName: profile.firstName, lastName: profile.lastName, phone: profile.phone ?? '' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `form.reset` is stable; re-running per `profile` is the intent.
  }, [profile]);

  function onSubmit(data: ProfileInput): void {
    updateProfile.mutate(data);
  }

  return {
    form,
    onSubmit,
    isLoading,
    isError,
    refetch,
    isSaving: updateProfile.isPending,
  };
}
