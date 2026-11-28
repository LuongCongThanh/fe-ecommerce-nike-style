# Manifest phạm vi — Auth và account theo public session boundary

Snapshot tham chiếu ngày 25/11/2026. File dưới đây là source hiện tại để tìm owner/consumer; sau các blocker, dùng owner đích trong mapping. Đây không phải approved.files hay quyền sửa mọi file. Refresh manifest khi lập plan; đổi path cơ học theo blocker không cần mở lại thiết kế. Consumer mới/khác semantics ngoài scope cần làm rõ trước khi sửa.

## Source owner hiện tại

- `src/features/account/addresses/components/AddressesClient.test.tsx`
- `src/features/account/addresses/components/AddressesClient.tsx`
- `src/features/account/addresses/hooks/useAddressForm.ts`
- `src/features/account/addresses/queries/addressKeys.ts`
- `src/features/account/addresses/queries/useAddresses.ts`
- `src/features/account/addresses/queries/useDeleteAddress.ts`
- `src/features/account/addresses/queries/useSaveAddress.ts`
- `src/features/account/addresses/queries/useSetDefaultAddress.ts`
- `src/features/account/addresses/schemas/address.ts`
- `src/features/account/profile/components/ProfileClient.test.tsx`
- `src/features/account/profile/components/ProfileClient.tsx`
- `src/features/account/profile/hooks/useProfileForm.ts`
- `src/features/account/profile/queries/useProfile.ts`
- `src/features/account/profile/queries/useUpdateProfile.ts`
- `src/features/account/profile/schemas/profile.ts`
- `src/features/auth/components/ApiErrorAlert.tsx`
- `src/features/auth/components/PasswordInput.test.tsx`
- `src/features/auth/components/PasswordInput.tsx`
- `src/features/auth/forgot-password/components/ForgotPasswordForm.tsx`
- `src/features/auth/hooks/useApiErrorMessage.ts`
- `src/features/auth/login/components/LoginForm.tsx`
- `src/features/auth/register/components/RegisterForm.tsx`
- `src/features/auth/reset-password/components/ResetPasswordForm.tsx`
- `src/features/auth/schemas/auth.ts`
- `src/features/auth/services/auth.ts`
- `src/features/auth/session/AuthGuard.tsx`
- `src/features/auth/session/AuthRuntimeProvider.tsx`
- `src/features/auth/session/roles.test.ts`
- `src/features/auth/session/roles.ts`
- `src/features/auth/session/useAuth.test.ts`
- `src/features/auth/session/useAuth.ts`
- `src/features/auth/stores/auth-store.test.ts`
- `src/features/auth/stores/auth.store.ts`

## Consumer trực tiếp hiện tại ngoài owner

- `src/app/[locale]/(auth)/forgot-password/page.tsx`
- `src/app/[locale]/(auth)/login/page.tsx`
- `src/app/[locale]/(auth)/register/page.tsx`
- `src/app/[locale]/(auth)/reset-password/[token]/page.tsx`
- `src/app/[locale]/(shop)/account/addresses/page.tsx`
- `src/app/[locale]/(shop)/account/layout.tsx`
- `src/app/[locale]/(shop)/account/profile/page.tsx`
- `src/app/[locale]/(shop)/checkout/layout.tsx`
- `src/app/_composition/AppProviders.test.tsx`
- `src/app/_composition/AppProviders.tsx`
- `src/features/storefront-shell/components/Header.tsx`
- `src/features/storefront-shell/hooks/useMergeGuestDataOnLogin.ts`

## Config/docs cần đối chiếu

- `eslint.config.mjs`
- `docs/architecture/README.md` và tài liệu owner tương ứng ở spec; chỉ cập nhật hiện trạng đã triển khai.

## Test cũ được thích ứng trong scope

- `src/app/_composition/AppProviders.test.tsx`
- `src/features/account/addresses/components/AddressesClient.test.tsx`
- `src/features/account/profile/components/ProfileClient.test.tsx`
- `src/features/auth/components/PasswordInput.test.tsx`
- `src/features/auth/session/roles.test.ts`
- `src/features/auth/session/useAuth.test.ts`
- `src/features/auth/stores/auth-store.test.ts`

Các test mới đi cạnh owner hoặc e2e/production theo policy. Với consumer test khác chưa xuất hiện ở scan, bổ sung manifest/file scope trước triển khai; không thay assertion để né regression. Không công khai private stores để cứu setup test.
