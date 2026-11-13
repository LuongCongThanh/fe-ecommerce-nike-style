import { expect, test } from '@playwright/test';

test.describe('Auth (register/login/forgot-reset)', () => {
  test('register → login → forgot password → reset → login again with the new password', async ({ page }) => {
    const email = `e2e-${Date.now()}@example.com`;
    const oldPassword = 'OldPassword1';
    const newPassword = 'NewPassword1';

    // 1. Register
    await page.goto('/vi/register');
    await page.getByLabel('Họ').fill('Nguyễn');
    await page.getByLabel('Tên').fill('An');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Mật khẩu', { exact: true }).fill(oldPassword);
    await page.getByLabel('Xác nhận mật khẩu').fill(oldPassword);
    await page.getByRole('button', { name: 'Tạo tài khoản' }).click();
    await expect(page).toHaveURL(/\/home$/);

    // Register auto-logs-in — log out so "login" below is a real, separate step.
    await page.getByRole('button', { name: 'Đăng xuất' }).click();
    await expect(page).toHaveURL(/\/login/);

    // 2. Login
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Mật khẩu').fill(oldPassword);
    await page.getByRole('button', { name: 'Đăng nhập' }).click();
    await expect(page).toHaveURL(/\/home$/);
    await expect(page.getByRole('button', { name: 'Đăng xuất' })).toBeVisible();

    await page.getByRole('button', { name: 'Đăng xuất' }).click();

    // 3. Forgot password — read the mock-only dev token from the network response (stands in for the
    // real email link, per decision-log.md Decision #90).
    await page.goto('/vi/forgot-password');
    await page.getByLabel('Email').fill(email);

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
    await page.getByLabel('Mật khẩu mới', { exact: true }).fill(newPassword);
    await page.getByLabel('Xác nhận mật khẩu mới').fill(newPassword);
    await page.getByRole('button', { name: 'Đặt lại mật khẩu' }).click();
    await expect(page).toHaveURL(/\/login$/);

    // 5. Login again with the new password — the old one no longer works, the new one does.
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Mật khẩu').fill(oldPassword);
    await page.getByRole('button', { name: 'Đăng nhập' }).click();
    // Asserts the generic fallback, not the mock's specific "Email hoặc mật khẩu không đúng" message —
    // a pre-existing, documented gap (two incompatible `ApiError` classes) means the real API error
    // message never reaches the form; see decision-log.md Decision #90's "known gaps, not fixed here".
    await expect(page.getByText('Đăng nhập thất bại. Vui lòng thử lại.')).toBeVisible();

    await page.getByLabel('Mật khẩu').fill(newPassword);
    await page.getByRole('button', { name: 'Đăng nhập' }).click();
    await expect(page).toHaveURL(/\/home$/);
    await expect(page.getByRole('button', { name: 'Đăng xuất' })).toBeVisible();
  });
});
