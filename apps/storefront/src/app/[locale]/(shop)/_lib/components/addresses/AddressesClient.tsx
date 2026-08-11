'use client';

import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import type { StorefrontAddress } from '@repo/api-sdk/endpoints/address';
import { QueryState } from '@repo/shared/query-state';
import { Badge } from '@repo/ui/badge';
import { Button } from '@repo/ui/button';
import { Checkbox } from '@repo/ui/checkbox';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Plus } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';

import { ConfirmDialog } from '@/app/[locale]/(shop)/_lib/components/common/ConfirmDialog';
import { useAddresses } from '@/app/[locale]/(shop)/_lib/hooks/addresses/useAddresses';
import { useDeleteAddress } from '@/app/[locale]/(shop)/_lib/hooks/addresses/useDeleteAddress';
import { useSaveAddress } from '@/app/[locale]/(shop)/_lib/hooks/addresses/useSaveAddress';
import { useSetDefaultAddress } from '@/app/[locale]/(shop)/_lib/hooks/addresses/useSetDefaultAddress';
import type { AddressFormInput } from '@/app/[locale]/(shop)/_lib/schemas/address';
import { addressFormSchema } from '@/app/[locale]/(shop)/_lib/schemas/address';

const EMPTY_FORM: AddressFormInput = { fullName: '', phone: '', province: '', district: '', ward: '', detail: '', isDefault: false };

function AddressForm({ initial, id, onDone }: { readonly initial: AddressFormInput; readonly id?: string; readonly onDone: () => void }) {
  const saveAddress = useSaveAddress();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<AddressFormInput>({ resolver: zodResolver(addressFormSchema), defaultValues: initial });

  return (
    <form
      onSubmit={handleSubmit((data) => {
        saveAddress.mutate(
          { id, data },
          {
            onSuccess: onDone,
          },
        );
      })}
      className="space-y-3 rounded-xl border p-4"
    >
      <div>
        <Label htmlFor="fullName">Họ tên người nhận</Label>
        <Input
          id="fullName"
          autoComplete="name"
          aria-invalid={errors.fullName != null}
          aria-describedby={errors.fullName != null ? 'fullName-error' : undefined}
          {...register('fullName')}
        />
        {errors.fullName != null ? (
          <p id="fullName-error" role="alert" className="text-destructive mt-1 text-sm">
            {errors.fullName.message}
          </p>
        ) : null}
      </div>
      <div>
        <Label htmlFor="phone">Số điện thoại</Label>
        <Input
          id="phone"
          placeholder="0912345678"
          autoComplete="tel"
          aria-invalid={errors.phone != null}
          aria-describedby={errors.phone != null ? 'phone-error' : undefined}
          {...register('phone')}
        />
        {errors.phone != null ? (
          <p id="phone-error" role="alert" className="text-destructive mt-1 text-sm">
            {errors.phone.message}
          </p>
        ) : null}
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <Label htmlFor="province">Tỉnh/Thành phố</Label>
          <Input
            id="province"
            aria-invalid={errors.province != null}
            aria-describedby={errors.province != null ? 'province-error' : undefined}
            {...register('province')}
          />
          {errors.province != null ? (
            <p id="province-error" role="alert" className="text-destructive mt-1 text-sm">
              {errors.province.message}
            </p>
          ) : null}
        </div>
        <div>
          <Label htmlFor="district">Quận/Huyện</Label>
          <Input
            id="district"
            aria-invalid={errors.district != null}
            aria-describedby={errors.district != null ? 'district-error' : undefined}
            {...register('district')}
          />
          {errors.district != null ? (
            <p id="district-error" role="alert" className="text-destructive mt-1 text-sm">
              {errors.district.message}
            </p>
          ) : null}
        </div>
        <div>
          <Label htmlFor="ward">Phường/Xã</Label>
          <Input
            id="ward"
            aria-invalid={errors.ward != null}
            aria-describedby={errors.ward != null ? 'ward-error' : undefined}
            {...register('ward')}
          />
          {errors.ward != null ? (
            <p id="ward-error" role="alert" className="text-destructive mt-1 text-sm">
              {errors.ward.message}
            </p>
          ) : null}
        </div>
      </div>
      <div>
        <Label htmlFor="detail">Địa chỉ chi tiết</Label>
        <Input
          id="detail"
          placeholder="Số nhà, tên đường..."
          aria-invalid={errors.detail != null}
          aria-describedby={errors.detail != null ? 'detail-error' : undefined}
          {...register('detail')}
        />
        {errors.detail != null ? (
          <p id="detail-error" role="alert" className="text-destructive mt-1 text-sm">
            {errors.detail.message}
          </p>
        ) : null}
      </div>
      <Controller
        control={control}
        name="isDefault"
        render={({ field }) => (
          <div className="flex items-center gap-2 text-sm">
            <Checkbox
              id="isDefault"
              checked={field.value}
              onCheckedChange={(checked) => {
                field.onChange(checked === true);
              }}
            />
            <Label htmlFor="isDefault">Đặt làm địa chỉ mặc định</Label>
          </div>
        )}
      />
      <div className="flex gap-2">
        <Button type="submit" disabled={saveAddress.isPending}>
          {saveAddress.isPending ? 'Đang lưu...' : 'Lưu địa chỉ'}
        </Button>
        <Button type="button" variant="outline" onClick={onDone}>
          Huỷ
        </Button>
      </div>
    </form>
  );
}

function AddressCard({ address }: { readonly address: StorefrontAddress }) {
  const [editing, setEditing] = useState(false);
  const deleteAddress = useDeleteAddress();
  const setDefaultAddress = useSetDefaultAddress();

  if (editing) {
    return (
      <AddressForm
        id={address.id}
        initial={{
          fullName: address.fullName,
          phone: address.phone,
          province: address.province,
          district: address.district,
          ward: address.ward,
          detail: address.detail,
          isDefault: address.isDefault,
        }}
        onDone={() => {
          setEditing(false);
        }}
      />
    );
  }

  return (
    <div className="space-y-2 rounded-xl border p-4">
      <div className="flex items-center gap-2">
        <p className="font-medium">{address.fullName}</p>
        {address.isDefault ? <Badge variant="outline">Mặc định</Badge> : null}
      </div>
      <p className="text-muted-foreground text-sm">{address.phone}</p>
      <p className="text-muted-foreground text-sm">
        {address.detail}, {address.ward}, {address.district}, {address.province}
      </p>
      <div className="flex flex-wrap gap-2 pt-1">
        <Button
          variant="outline"
          onClick={() => {
            setEditing(true);
          }}
        >
          Sửa
        </Button>
        {!address.isDefault && (
          <Button
            variant="outline"
            disabled={setDefaultAddress.isPending}
            onClick={() => {
              setDefaultAddress.mutate(address.id);
            }}
          >
            Đặt làm mặc định
          </Button>
        )}
        <ConfirmDialog
          trigger={
            <Button variant="outline" disabled={deleteAddress.isPending}>
              Xoá
            </Button>
          }
          title="Xoá địa chỉ này?"
          description="Địa chỉ sẽ bị xoá vĩnh viễn và không thể khôi phục."
          confirmLabel="Xoá"
          onConfirm={() => {
            deleteAddress.mutate(address.id);
          }}
          loading={deleteAddress.isPending}
        />
      </div>
    </div>
  );
}

export function AddressesClient(): React.JSX.Element {
  const { data: addresses, isLoading, isError, refetch } = useAddresses();
  const [isAdding, setIsAdding] = useState(false);

  return (
    <QueryState
      isLoading={isLoading}
      error={isError ? new Error('Không thể tải danh sách địa chỉ') : null}
      onRetry={() => {
        refetch().catch(() => {
          /* error state already surfaced via isError */
        });
      }}
      errorTitle="Không thể tải danh sách địa chỉ"
    >
      <div className="space-y-4">
        {addresses?.map((address) => (
          <AddressCard key={address.id} address={address} />
        ))}

        {addresses?.length === 0 && !isAdding ? <p className="text-muted-foreground text-center">Bạn chưa có địa chỉ nào.</p> : null}

        {isAdding ? (
          <AddressForm
            initial={EMPTY_FORM}
            onDone={() => {
              setIsAdding(false);
            }}
          />
        ) : (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setIsAdding(true);
            }}
          >
            <Plus className="size-4" data-icon="inline-start" />
            Thêm địa chỉ mới
          </Button>
        )}
      </div>
    </QueryState>
  );
}
