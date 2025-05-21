import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {
  readonly page: Page;
  readonly title: Locator;

  constructor(page: Page) {
    super(page);
    this.page = page;
    this.title = page.getByTestId('dashboard-title');
  }

  async goto() {
    await this.page.goto('/dashboard');
  }
}
