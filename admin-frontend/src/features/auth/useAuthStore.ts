import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import jwtDecode from 'jwt-decode';
import {
  login as loginApi,
  logout as logoutApi,
  refreshToken as refreshTokenApi,
  updateProfile as updateProfileApi,
} from './authApi';
import type { JwtPayload } from './types';
import type { ApiErrorResponse } from '@/api/types';

interface AuthState {
  isLoading: boolean;
  token: string;
  firstName: string;
  lastName: string;
  id: string;
  email: string;
  dateOfBirth: string | null;
  isAuthenticated: boolean;
  expiresAt: number | null;
}

interface AuthActions {
  setToken: (token: string) => void;
  clearAuth: () => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  updateProfile: (
    firstName: string,
    lastName: string,
    email: string,
    dateOfBirth: string | null,
  ) => Promise<void>;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist<AuthStore>(
    (set, get) => ({
      isLoading: false,
      token: '',
      firstName: '',
      lastName: '',
      id: '',
      email: '',
      dateOfBirth: null,
      isAuthenticated: false,
      expiresAt: null,
      setToken: (token: string) => {
        if (!token) {
          const cleared: AuthState = {
            token: '',
            firstName: '',
            lastName: '',
            id: '',
            email: '',
            dateOfBirth: null,
            isAuthenticated: false,
            expiresAt: null,
            isLoading: false,
          };
          set(cleared);
          return;
        }
        try {
          const decoded = jwtDecode<JwtPayload>(token);
          const newState: AuthState = {
            token,
            firstName: decoded.firstName || '',
            lastName: decoded.lastName || '',
            id: decoded.id || '',
            email: decoded.email || '',
            dateOfBirth: decoded.dateOfBirth || null,
            isAuthenticated: true,
            expiresAt: decoded.exp * 1000,
            isLoading: false,
          };
          set(newState);
        } catch {
          const cleared: AuthState = {
            token: '',
            firstName: '',
            lastName: '',
            id: '',
            email: '',
            dateOfBirth: null,
            isAuthenticated: false,
            expiresAt: null,
            isLoading: false,
          };
          set(cleared);
        }
      },
      clearAuth: () => {
        const cleared: AuthState = {
          token: '',
          firstName: '',
          lastName: '',
          id: '',
          email: '',
          dateOfBirth: null,
          isAuthenticated: false,
          expiresAt: null,
          isLoading: false,
        };
        set(cleared);
      },
      login: async (email: string, password: string) => {
        try {
          const response = await loginApi(email, password);
          if (response.accessToken) {
            get().setToken(response.accessToken);
            return;
          }
          throw new Error('No access token returned');
        } catch {
          throw new Error('Login error');
        }
      },
      logout: async () => {
        try {
          await logoutApi();
          get().clearAuth();
        } catch {
          throw new Error('Logout error');
        }
      },
      checkAuth: async () => {
        set({ isLoading: true });
        try {
          const response = await refreshTokenApi();
          if (response && response.accessToken) {
            get().setToken(response.accessToken);
            set({ isLoading: false });
            return true;
          }
          get().clearAuth();
          set({ isLoading: false });
          return false;
        } catch {
          get().clearAuth();
          set({ isLoading: false });
          return false;
        }
      },
      updateProfile: async (
        firstName: string,
        lastName: string,
        email: string,
        dateOfBirth: string | null,
      ) => {
        try {
          await updateProfileApi(firstName, lastName, email, dateOfBirth);
          set({
            firstName: firstName,
            lastName: lastName,
            email: email,
            dateOfBirth: dateOfBirth,
          });
          await get().checkAuth();
        } catch (error: unknown) {
          const err = error as { response?: ApiErrorResponse };
          throw err;
        }
      },
    }),
    {
      name: 'adminAuthState', // or another unique key for admin
    },
  ),
);
