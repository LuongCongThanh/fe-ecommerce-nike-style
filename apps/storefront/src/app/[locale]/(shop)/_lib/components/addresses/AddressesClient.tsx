'use client';

// Hallmark redesign · design-system: design.md · scope: app page (functional, no enrichment)
import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import type { StorefrontAddress } from '@repo/api-sdk/endpoints/address';
import { QueryState } from '@repo/shared/query-state';
import { Badge } from '@repo/ui/badge';
import { Button } from '@repo/ui/button';
import { Checkbox } from '@repo/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@repo/ui/form';
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
  const form = useForm<AddressFormInput>({ resolver: zodResolver(addressFormSchema), defaultValues: initial });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => {
          saveAddress.mutate(
            { id, data },
            {
              onSuccess: onDone,
            },
          );
        })}
        className="bg-card space-y-4 rounded-xl border p-4"
      >
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Họ tên người nhận</FormLabel>
              <FormControl>
                <Input autoComplete="name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Số điện thoại</FormLabel>
              <FormControl>
                <Input placeholder="0912345678" autoComplete="tel" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="province"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tỉnh/Thành phố</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="district"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quận/Huyện</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="ward"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phường/Xã</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="detail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Địa chỉ chi tiết</FormLabel>
              <FormControl>
                <Input placeholder="Số nhà, tên đường..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Controller
          control={form.control}
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
    </Form>
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
    <div className="bg-card space-y-2 rounded-xl border p-4">
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-medium">{address.fullName}</p>
        {address.isDefault ? (
          <Badge variant="outline" className="border-secondary-300 text-secondary-700">
            Mặc định
          </Badge>
        ) : null}
      </div>
      <p className="text-muted-foreground text-sm">{address.phone}</p>
      <p className="text-muted-foreground text-sm text-pretty">
        {address.detail}, {address.ward}, {address.district}, {address.province}
      </p>
      <div className="flex flex-wrap gap-2 pt-2">
        <Button
          variant="outline"
          className="border-secondary-300 text-secondary-700 hover:bg-secondary-50 hover:text-secondary-800"
          onClick={() => {
            setEditing(true);
          }}
        >
          Sửa
        </Button>
        {!address.isDefault && (
          <Button
            variant="outline"
            className="border-secondary-300 text-secondary-700 hover:bg-secondary-50 hover:text-secondary-800"
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
            <Button variant="outline" className="text-destructive hover:bg-destructive/10 hover:text-destructive" disabled={deleteAddress.isPending}>
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

        {addresses?.length === 0 && !isAdding ? <p className="text-muted-foreground py-10 text-center">Bạn chưa có địa chỉ nào.</p> : null}

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
