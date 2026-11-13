'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { useSaveAddress } from '@/features/account/addresses/queries/useSaveAddress';
import type { AddressFormInput } from '@/features/account/addresses/schemas/address';
import { addressFormSchema } from '@/features/account/addresses/schemas/address';

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
