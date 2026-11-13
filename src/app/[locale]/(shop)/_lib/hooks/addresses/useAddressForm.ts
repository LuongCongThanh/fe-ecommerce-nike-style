'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { useSaveAddress } from '@/app/[locale]/(shop)/_lib/hooks/addresses/useSaveAddress';
import type { AddressFormInput } from '@/app/[locale]/(shop)/_lib/schemas/address';
import { addressFormSchema } from '@/app/[locale]/(shop)/_lib/schemas/address';

interface UseAddressFormOptions {
  readonly initial: AddressFormInput;
  readonly id?: string;
  /** Called once the save succeeds — e.g. closes the add/edit form. */
  readonly onSaved: () => void;
}

/** Owns the add/edit address form's whole lifecycle so `AddressForm` only renders — the `.mutate(...,
 * { onSuccess })` wiring used to sit directly in the component's submit handler. */
export function useAddressForm({ initial, id, onSaved }: UseAddressFormOptions) {
  const saveAddress = useSaveAddress();
  const form = useForm<AddressFormInput>({ resolver: zodResolver(addressFormSchema), defaultValues: initial });

  function onSubmit(data: AddressFormInput): void {
    saveAddress.mutate({ id, data }, { onSuccess: onSaved });
  }

  return { form, onSubmit, isSaving: saveAddress.isPending };
}
