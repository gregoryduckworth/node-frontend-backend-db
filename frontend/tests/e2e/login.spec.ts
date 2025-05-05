import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should display validation error for invalid credentials', async ({ page }) => {
    await page.getByLabel(/email/i).fill('invalid@example.com');
    await page.getByLabel(/password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /login/i }).click();
    const errorMessage = page.getByText(/Invalid credentials|Email not found/i);
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to forgot password page', async ({ page }) => {
    await page.getByRole('link', { name: /forgot password/i }).click();
    await expect(page).toHaveURL(/.*forgot-password/);
    await expect(
      page.getByRole('heading', { name: /forgot password|reset password/i })
    ).toBeVisible();
  });

  test('should navigate to register page', async ({ page }) => {
    await page.getByRole('link', { name: /register|sign up|create account/i }).click();
    await expect(page).toHaveURL(/.*register/);
    await expect(
      page.getByRole('heading', { name: /register|sign up|create account/i })
    ).toBeVisible();
  });
});
