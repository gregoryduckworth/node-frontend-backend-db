import { test } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('should display validation error for invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login('invalid@example.com', 'wrongpassword');
    await loginPage.checkToastMessage('Email not found');
  });

  test('should be able to login', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login('test@example.com', 'Password1');
  });
});
