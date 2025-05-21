import { Locator, Page, expect } from '@playwright/test';

export class BasePage {
  readonly page: Page;
  readonly toast: (text: string) => Locator;

  constructor(page: Page) {
    this.page = page;
    this.toast = (text: string) => this.page.getByRole('listitem').getByText(text);
  }

  async checkToastMessage(text: string) {
    await expect(this.toast(text)).toBeVisible();
  }
}
