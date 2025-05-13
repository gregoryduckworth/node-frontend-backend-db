import { request } from '@playwright/test';
import { playwrightBaseUrl } from '../../playwright.config';

export async function resetDb(): Promise<void> {
  if (!playwrightBaseUrl) {
    throw new Error('playwrightBaseUrl is not defined in the environment variables');
  }
  const apiBase = playwrightBaseUrl.replace('5173', '3001');
  const context = await request.newContext();
  try {
    const response = await context.post(`${apiBase}/test/reset-db`);
    if (!response.ok()) {
      throw new Error('Failed to reset database');
    }
  } finally {
    await context.dispose();
  }
}
