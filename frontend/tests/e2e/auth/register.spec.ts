import { expect, test } from '@playwright/test';
import { RegisterPage } from '../pages/RegisterPage';
import { resetDb } from '../testUtils';

test.describe('Register Page', () => {
  test.beforeEach(async ({ page }) => {
    await resetDb();
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
  });

  test('should validate password requirements', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.attemptRegister(
      'Test',
      'User',
      'test@example.com',
      '1990-01-01',
      'pass',
      'pass',
    );
    await registerPage.passwordValidationError();
  });

  test('should validate date of birth requirements', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    // Test with future date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const futureDate = tomorrow.toISOString().split('T')[0];

    await registerPage.attemptRegister(
      'Test',
      'User',
      'test@example.com',
      futureDate,
      'Password123',
      'Password123',
    );

    // Check that date of birth error is shown
    const dateOfBirthError = page.getByTestId('date-of-birth-error');
    await expect(dateOfBirthError).toBeVisible();
  });

  test('should be able to register', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.attemptRegister(
      'Test',
      'User',
      'test@example.com',
      '1990-01-01',
      'Password123',
      'Password123',
    );
    await registerPage.registerButton.click();
    await registerPage.checkToastMessage('Registration successful');
    await expect(page).toHaveURL(/\/login/);
  });
});
