import { create } from 'zustand';
import jwtDecode from 'jwt-decode';
import {
  login as loginApi,
  logout as logoutApi,
  refreshToken as refreshTokenApi,
  updateProfile as updateProfileApi,
} from './authApi';
import type { AuthState, JwtPayload } from './types';
import type { ApiErrorResponse } from '@/api/types';

const AUTH_STORAGE_KEY = 'authState';

function loadPersistedAuth() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return undefined;
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

function persistAuthState(state: Partial<AuthState>) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(pickAuthState(state)));
}

function pickAuthState(state: Partial<AuthState>): Partial<AuthState> {
  return {
    token: state.token,
    firstName: state.firstName,
    lastName: state.lastName,
    id: state.id,
    email: state.email,
    dateOfBirth: state.dateOfBirth,
    isAuthenticated: state.isAuthenticated,
    expiresAt: state.expiresAt,
  };
}

export const useAuthStore = create<AuthState>((set, get) => {
  const persisted = loadPersistedAuth() || {
    token: '',
    firstName: '',
    lastName: '',
    id: '',
    email: '',
    dateOfBirth: null,
    isAuthenticated: false,
    expiresAt: null,
  };
  return {
    ...persisted,
    isLoading: true,
    setToken: (token) => {
      if (!token) {
        const cleared = {
          token: '',
          firstName: '',
          lastName: '',
          id: '',
          email: '',
          dateOfBirth: null,
          isAuthenticated: false,
          expiresAt: null,
        };
        set(cleared);
        persistAuthState(cleared);
        return;
      }
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        const newState = {
          token,
          firstName: decoded.firstName || '',
          lastName: decoded.lastName || '',
          id: decoded.id || '',
          email: decoded.email || '',
          dateOfBirth: decoded.dateOfBirth || null,
          isAuthenticated: true,
          expiresAt: decoded.exp * 1000,
        };
        set(newState);
        persistAuthState(newState);
      } catch (error: unknown) {
        console.error('Error decoding JWT token:', error);
        const cleared = {
          token: '',
          firstName: '',
          lastName: '',
          id: '',
          email: '',
          dateOfBirth: null,
          isAuthenticated: false,
          expiresAt: null,
        };
        set(cleared);
        persistAuthState(cleared);
      }
    },
    clearAuth: () => {
      const cleared = {
        token: '',
        firstName: '',
        lastName: '',
        id: '',
        email: '',
        dateOfBirth: null,
        isAuthenticated: false,
        expiresAt: null,
      };
      set(cleared);
      persistAuthState(cleared);
    },
    login: async (email, password) => {
      try {
        const response = await loginApi(email, password);
        if (response.accessToken) {
          get().setToken(response.accessToken);
          return;
        }
        throw new Error('No access token returned');
      } catch (error: unknown) {
        const err = error as { response?: ApiErrorResponse };
        console.error('Login error:', err);
        throw err;
      }
    },
    logout: async () => {
      try {
        await logoutApi();
        get().clearAuth();
      } catch (error: unknown) {
        const err = error as { response?: ApiErrorResponse };
        console.error('Logout error:', err);
        throw err;
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
      } catch (error: unknown) {
        const err = error as { response?: ApiErrorResponse };
        console.error('Auth check error:', err);
        get().clearAuth();
        set({ isLoading: false });
        return false;
      }
    },
    updateProfile: async (firstName, lastName, email, dateOfBirth) => {
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
        console.error('Profile update error:', err);
        throw err;
      }
    },
  };
});
