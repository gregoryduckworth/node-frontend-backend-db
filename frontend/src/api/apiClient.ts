export type ApiErrorResponse = {
  response: {
    data: any;
    status: number;
  };
};

interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  includeCredentials?: boolean;
}

export const apiClient = async <T>(
  url: string,
  options: RequestOptions = {}
): Promise<T> => {
  const {
    method = "GET",
    headers = {},
    body,
    includeCredentials = false,
  } = options;

  const requestOptions: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    ...(includeCredentials ? { credentials: "include" } : {}),
    ...(body ? { body: JSON.stringify(body) } : {}),
  };

  const response = await fetch(url, requestOptions);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw {
      response: { data: errorData, status: response.status },
    } as ApiErrorResponse;
  }

  // Handle empty responses
  const contentType = response.headers.get("content-type");
  if (
    response.status === 204 ||
    !contentType ||
    !contentType.includes("application/json")
  ) {
    return {} as T;
  }

  const text = await response.text();
  if (!text) {
    return {} as T;
  }

  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse response:", e);
    return {} as T;
  }
};
