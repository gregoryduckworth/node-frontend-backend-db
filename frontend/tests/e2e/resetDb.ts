import { request } from '@playwright/test';
import { playwrightBaseUrl } from '../../playwright.config';

export async function resetDb() {
  const apiBase = (playwrightBaseUrl || '').replace('5173', '3001');
  if (!apiBase) {
    throw new Error('PLAYWRIGHT_BASE_URL is not defined in the environment variables');
  }
  const context = await request.newContext();
  const response = await context.post(`${apiBase}/test/reset-db`);
  if (!response.ok()) {
    throw new Error('Failed to reset database');
  }
  await context.dispose();
}
