import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class RegisterPage extends BasePage {
  readonly page: Page;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly dateOfBirthInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly registerButton: Locator;
  readonly passwordRequirements: Locator;

  constructor(page: Page) {
    super(page);
    this.page = page;
    this.firstNameInput = this.page.getByTestId('first-name-input');
    this.lastNameInput = this.page.getByTestId('last-name-input');
    this.emailInput = this.page.getByTestId('email-input');
    this.dateOfBirthInput = this.page.getByTestId('date-of-birth-input');
    this.passwordInput = this.page.getByTestId('password-input');
    this.confirmPasswordInput = this.page.getByTestId('confirm-password-input');
    this.registerButton = this.page.getByTestId('register-button');
    this.passwordRequirements = this.page.getByTestId('password-requirements');
  }

  async goto() {
    await this.page.goto('/register');
  }
  async attemptRegister(
    firstName: string,
    lastName: string,
    email: string,
    dateOfBirth: string,
    password: string,
    confirmPassword?: string,
  ) {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.emailInput.fill(email);
    await this.dateOfBirthInput.fill(dateOfBirth);
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(confirmPassword || password);
  }

  async passwordValidationError() {
    await expect(this.passwordRequirements).toContainClass('error');
  }
}
