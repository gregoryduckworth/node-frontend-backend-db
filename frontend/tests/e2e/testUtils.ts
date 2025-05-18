import { request } from '@playwright/test';
import { playwrightBaseUrl } from '../../playwright.config';
import type { RegisterRequest } from '../../src/features/auth/types';

async function getBaseAPIUrl() {
  if (!playwrightBaseUrl) {
    throw new Error('playwrightBaseUrl is not defined in the environment variables');
  }
  const basePort = process.env.VITE_PORT || '5173';
  const apiPort = process.env.VITE_API_PORT || '3001';
  const apiBase = playwrightBaseUrl.replace(basePort, apiPort);
  return apiBase;
}

/**
 * Resets the test database to a clean state.
 */
export async function resetDb(): Promise<void> {
  const context = await request.newContext();
  try {
    const response = await context.post(`${await getBaseAPIUrl()}/test/reset-db`);
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
      password: user?.password ?? 'Password1',
      confirmPassword: user?.password ?? 'Password1',
      ...(user?.dateOfBirth ? { dateOfBirth: user.dateOfBirth } : {}),
    };
    const response = await context.post(`${await getBaseAPIUrl()}/auth/register`, {
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
