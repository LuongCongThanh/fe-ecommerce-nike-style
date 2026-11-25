import { expect, test } from '@playwright/test';

import { fillField, logOut, submitLogin } from '@/../e2e/support/session';

test.describe('Auth (register/login/forgot-reset)', () => {
  test('register → login → forgot password → reset → login again with the new password', async ({ page }) => {
    const email = `e2e-${Date.now()}@example.com`;
    const oldPassword = 'OldPassword1';
    const newPassword = 'NewPassword1';

    // 1. Register
    await page.goto('/vi/register');
    await fillField(page.getByLabel('Họ'), 'Nguyễn');
    await fillField(page.getByLabel('Tên'), 'An');
    await fillField(page.getByLabel('Email'), email);
    await fillField(page.getByLabel('Mật khẩu', { exact: true }), oldPassword);
    await fillField(page.getByLabel('Xác nhận mật khẩu'), oldPassword);
    await page.getByRole('button', { name: 'Tạo tài khoản' }).click();
    await expect(page).toHaveURL(/\/home$/);

    // Register auto-logs-in — log out so "login" below is a real, separate step.
    await logOut(page);

    // 2. Login
    await submitLogin(page, { email, password: oldPassword });
    await expect(page).toHaveURL(/\/home$/);
    await expect(page.getByRole('button', { name: 'Tài khoản' })).toBeVisible();

    await logOut(page);

    // 3. Forgot password — read the mock-only dev token from the network response (stands in for the
    // real email link, per decision-log.md Decision #90).
    await page.goto('/vi/forgot-password');
    await fillField(page.getByLabel('Email'), email);

    const [response] = await Promise.all([
      page.waitForResponse((res) => res.url().includes('/api/auth/password/reset/') && res.request().method() === 'POST'),
      page.getByRole('button', { name: 'Gửi link đặt lại mật khẩu' }).click(),
    ]);
    const { devResetToken, devUid } = (await response.json()) as { devResetToken: string; devUid: string };
    expect(devResetToken).toBeTruthy();
    expect(devUid).toBeTruthy();
    await expect(page.getByText('Kiểm tra email của bạn')).toBeVisible();

    // 4. Reset password
    await page.goto(`/vi/reset-password/${devResetToken}?uid=${devUid}`);
    await fillField(page.getByLabel('Mật khẩu mới', { exact: true }), newPassword);
    await fillField(page.getByLabel('Xác nhận mật khẩu mới'), newPassword);
    await page.getByRole('button', { name: 'Đặt lại mật khẩu' }).click();
    await expect(page).toHaveURL(/\/login$/);

    // 5. Login again with the new password — the old one no longer works, the new one does.
    await submitLogin(page, { email, password: oldPassword });
    // The form now shows the API's own message. Decision #90 listed a gap where two `ApiError` classes
    // kept that message from the form and only the generic fallback appeared; the current source no
    // longer has that gap, so this asserts the specific message the mock returns for bad credentials.
    await expect(page.getByRole('alert').filter({ hasText: 'Email hoặc mật khẩu không đúng.' })).toBeVisible();

    await submitLogin(page, { email, password: newPassword });
    await expect(page).toHaveURL(/\/home$/);
    await expect(page.getByRole('button', { name: 'Tài khoản' })).toBeVisible();
  });
});
