import { test, expect } from '@playwright/test';

test.describe('Register Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
  });

  test('should validate password requirements', async ({ page }) => {
    await page.getByLabel(/first name/i).fill('Test');
    await page.getByLabel(/last name/i).fill('User');
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/^password$/i).fill('pass');
    await page.getByLabel(/^password$/i).blur();
    await expect(page.locator('li').filter({ hasText: /at least 8 characters/i })).toBeVisible();
    await page.getByLabel(/^password$/i).fill('password123');
    await page.getByLabel(/^password$/i).blur();
    await expect(page.locator('li').filter({ hasText: /uppercase/i })).toBeVisible();
    await page.getByLabel(/^password$/i).fill('Password123');
    await page.getByLabel(/^password$/i).blur();
    await expect(
      page.locator('li').filter({ hasText: /at least 8 characters/i })
    ).not.toBeVisible();
    await expect(page.locator('li').filter({ hasText: /uppercase/i })).not.toBeVisible();
  });

  test('should validate password confirmation', async ({ page }) => {
    await page.getByLabel(/first name/i).fill('Test');
    await page.getByLabel(/last name/i).fill('User');
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/^password$/i).fill('Password123');
    await page.getByLabel(/confirm password/i).fill('Password456');
    await page.getByLabel(/confirm password/i).blur();
    await expect(page.getByText(/passwords.*match/i)).toBeVisible();
    await page.getByLabel(/confirm password/i).fill('Password123');
    await page.getByLabel(/confirm password/i).blur();
    await expect(page.getByText(/passwords.*match/i)).not.toBeVisible();
  });

  test('should navigate back to login page', async ({ page }) => {
    await page.getByRole('link', { name: /login|sign in|already have an account/i }).click();
    await expect(page).toHaveURL(/.*login/);
    await expect(page.getByRole('heading', { name: /login|sign in/i })).toBeVisible();
  });
});
