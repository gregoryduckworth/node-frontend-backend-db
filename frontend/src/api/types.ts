export type ApiErrorResponse = {
  response: {
    data: any;
    status: number;
    statusText?: string;
  };
  message?: string;
};

export interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  includeCredentials?: boolean;
  timeout?: number;
  skipCache?: boolean;
  cacheTime?: number;
}

export interface CacheItem<T> {
  data: T;
  expiry: number;
}
