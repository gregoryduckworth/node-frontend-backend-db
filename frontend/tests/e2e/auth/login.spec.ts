import { expect, test } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { createTestUser } from '../testUtils';

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('should display validation error for invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login('invalid@example.com', 'wrongpassword');
    await loginPage.checkToastMessage('Invalid email or password');
  });

  test('should be able to login', async ({ page }) => {
    const { email } = await createTestUser();
    const loginPage = new LoginPage(page);
    const dashboardPage = await loginPage.login(email, 'Password1');
    await dashboardPage.checkToastMessage('Logged in successfully');
    await expect(dashboardPage.title).toBeVisible();
  });
});
