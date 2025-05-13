export interface ApiErrorResponse {
  message: string;
  code?: string | number;
  errors?: Record<string, string[]>;
  status?: number;
  [key: string]: unknown;
}

export interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
  includeCredentials?: boolean;
  timeout?: number;
  skipCache?: boolean;
  cacheTime?: number;
}

export interface CacheItem<T> {
  data: T;
  expiry: number;
}
