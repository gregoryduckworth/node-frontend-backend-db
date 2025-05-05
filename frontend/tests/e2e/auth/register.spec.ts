import { test } from '@playwright/test';
import { RegisterPage } from '../pages/RegisterPage';

test.describe('Register Page', () => {
  test.beforeEach(async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
  });

  test('should validate password requirements', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.attemptRegister('Test', 'User', 'test@example.com', 'pass', 'pass');
    await registerPage.passwordValidate('at least 8 characters');
    await registerPage.passwordValidate('uppercase');
    await registerPage.passwordValidate('at least one number');
  });

  test('should be able to register', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.attemptRegister('Test', 'User', 'test@example.com', 'Password123');
    await registerPage.registerButton.click();
  });
});
