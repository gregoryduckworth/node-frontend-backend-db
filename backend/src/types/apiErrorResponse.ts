export interface ApiErrorResponse {
  message: string;
  code?: string | number;
  errors?: Record<string, string[]>;
  status?: number;
  [key: string]: unknown;
}
