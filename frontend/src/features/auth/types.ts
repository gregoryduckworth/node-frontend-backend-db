export interface AuthResponse {
  accessToken: string;
}

export interface ApiMessageResponse {
  message: string;
}

export interface RefreshTokenResponse {
  accessToken?: string;
}

export interface JwtPayload {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth?: string | null;
  exp: number;
  [key: string]: unknown;
}

export interface AuthState {
  token: string;
  firstName: string;
  lastName: string;
  id: string;
  email: string;
  dateOfBirth: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  expiresAt: number | null;

  setToken: (token: string) => void;
  clearAuth: () => void;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  updateProfile: (
    firstName: string,
    lastName: string,
    email: string,
    dateOfBirth: string | null,
  ) => Promise<void>;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  dateOfBirth: string;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth?: string | null;
}
