import { API_ENDPOINTS } from '@/config/auth';
import { handleApiError } from './handleApiError';
import type { ApiErrorResponse, RequestOptions, CacheItem } from './types';

const cache = new Map<string, CacheItem<unknown>>();

const createCacheKey = (url: string, options: RequestOptions): string => {
  return `${url}:${options.includeCredentials}`;
};

export const clearCache = (url?: string): void => {
  if (url) {
    for (const key of Array.from(cache.keys())) {
      if (key.startsWith(url)) {
        cache.delete(key);
      }
    }
  } else {
    cache.clear();
  }
};

export const apiClient = async <T>(url: string, options: RequestOptions = {}): Promise<T> => {
  const {
    method = 'GET',
    headers = {},
    body,
    includeCredentials = false,
    timeout = 30000,
    skipCache = false,
    cacheTime = 5 * 60 * 1000,
  } = options;

  if (method === 'GET' && !skipCache) {
    const cacheKey = createCacheKey(url, options);
    const cachedItem = cache.get(cacheKey);

    if (cachedItem && cachedItem.expiry > Date.now()) {
      return cachedItem.data as T;
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const requestOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      ...(includeCredentials ? { credentials: 'include' } : {}),
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal: controller.signal,
    };

    const response = await fetch(url, requestOptions);

    // Suppress notification for 403 from /api/token
    if (response.status === 403 && url.endsWith(API_ENDPOINTS.REFRESH_TOKEN)) {
      return {} as T;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorObj = {
        response: {
          data: errorData,
          status: response.status,
          statusText: response.statusText,
        },
        message: `Request failed with status ${response.status}: ${response.statusText}`,
      } as ApiErrorResponse;
      throw errorObj;
    }

    // Handle empty responses
    const contentType = response.headers.get('content-type');
    if (response.status === 204 || !contentType || !contentType.includes('application/json')) {
      return {} as T;
    }

    const text = await response.text();
    if (!text) {
      return {} as T;
    }

    try {
      const data = JSON.parse(text) as T;
      if (method === 'GET' && !skipCache) {
        const cacheKey = createCacheKey(url, options);
        cache.set(cacheKey, {
          data,
          expiry: Date.now() + cacheTime,
        });
      }

      return data;
    } catch (e) {
      console.error('Failed to parse response:', e);
      throw {
        response: {
          data: { parseError: true },
          status: response.status,
        },
        message: `Failed to parse JSON response: ${e instanceof Error ? e.message : String(e)}`,
      } as ApiErrorResponse;
    }
  } catch (error: unknown) {
    handleApiError(error);
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};
