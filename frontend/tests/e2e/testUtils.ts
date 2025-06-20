import { request } from '@playwright/test';
import { playwrightBaseUrl } from '../../playwright.config';
import type { RegisterRequest } from '../../src/features/auth/types';

function getBaseAPIUrlSync() {
  if (!playwrightBaseUrl) {
    throw new Error('playwrightBaseUrl is not defined in the environment variables');
  }
  const url = new URL(playwrightBaseUrl);
  url.port = process.env.VITE_API_PORT || '3001';
  if (process.env.VITE_API_PATH) {
    url.pathname = process.env.VITE_API_PATH;
  } else {
    url.pathname = '';
  }
  return url.origin + url.pathname.replace(/\/$/, '');
}

/**
 * Resets the test database to a clean state.
 */
export async function resetDb(): Promise<void> {
  const context = await request.newContext();
  try {
    const response = await context.post(`${getBaseAPIUrlSync()}/test/reset-db`);
    if (!response.ok()) {
      throw new Error('Failed to reset database');
    }
  } finally {
    await context.dispose();
  }
}

/**
 * Creates a test user in the database. All fields are optional; defaults are provided.
 * Returns the user object used for registration (including confirmPassword).
 */
export async function createTestUser(
  user?: Partial<RegisterRequest>,
): Promise<RegisterRequest & { confirmPassword: string }> {
  const context = await request.newContext();
  try {
    const body: RegisterRequest & { confirmPassword: string } = {
      firstName: user?.firstName ?? 'Test',
      lastName: user?.lastName ?? 'User',
      email: user?.email ?? `testuser_${Date.now()}@example.com`,
      dateOfBirth: user?.dateOfBirth ?? '2000-01-01',
      password: user?.password ?? 'Password1',
      confirmPassword: user?.password ?? 'Password1',
      ...(user?.dateOfBirth ? { dateOfBirth: user.dateOfBirth } : {}),
    };
    const response = await context.post(`${getBaseAPIUrlSync()}/auth/register`, {
      data: body,
    });
    if (!response.ok()) {
      const text = await response.text();
      console.log(text);
      throw new Error('Failed to create test user');
    }
    return body;
  } finally {
    await context.dispose();
  }
}
