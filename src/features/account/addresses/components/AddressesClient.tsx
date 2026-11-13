'use client';

// Hallmark redesign · design-system: design.md · scope: app page (functional, no enrichment)
import { useState } from 'react';

import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Controller } from 'react-hook-form';

import { useAddressForm } from '@/features/account/addresses/hooks/useAddressForm';
import { useAddresses } from '@/features/account/addresses/queries/useAddresses';
import { useDeleteAddress } from '@/features/account/addresses/queries/useDeleteAddress';
import { useSetDefaultAddress } from '@/features/account/addresses/queries/useSetDefaultAddress';
import type { AddressFormInput } from '@/features/account/addresses/schemas/address';
import type { StorefrontAddress } from '@/lib/api/endpoints/address';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { Checkbox } from '@/shared/ui/Checkbox';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/Form';
import { Input } from '@/shared/ui/Input';
import { Label } from '@/shared/ui/Label';
import { QueryState } from '@/shared/ui/QueryState';

const EMPTY_FORM: AddressFormInput = { fullName: '', phone: '', province: '', district: '', ward: '', detail: '', isDefault: false };

function AddressForm({ initial, id, onDone }: { readonly initial: AddressFormInput; readonly id?: string; readonly onDone: () => void }) {
  const { form, onSubmit, isSaving } = useAddressForm({ initial, id, onSaved: onDone });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="bg-card space-y-4 rounded-xl border p-4">
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
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Đang lưu...' : 'Lưu địa chỉ'}
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
  const t = useTranslations('common');
  const tAddress = useTranslations('address');
  const { data: addresses, isLoading, isError, refetch } = useAddresses();
  const [isAdding, setIsAdding] = useState(false);

  return (
    <QueryState
      isLoading={isLoading}
      error={isError ? new Error(tAddress('loadError')) : null}
      onRetry={() => {
        refetch().catch(() => {
          /* error state already surfaced via isError */
        });
      }}
      loadingLabel={t('loading')}
      errorTitle={tAddress('loadError')}
      errorFallbackDescription={t('errorDescription')}
      retryLabel={t('retry')}
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
