import { create } from 'zustand';
import jwtDecode from 'jwt-decode';
import {
  login as loginApi,
  logout as logoutApi,
  refreshToken as refreshTokenApi,
  updateProfile as updateProfileApi,
} from '@/api/auth';

interface JwtPayload {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth?: string | null;
  exp: number;
  [key: string]: any;
}

interface AuthState {
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
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  updateProfile: (
    firstName: string,
    lastName: string,
    email: string,
    dateOfBirth: string | null
  ) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: '',
  firstName: '',
  lastName: '',
  id: '',
  email: '',
  dateOfBirth: null,
  isAuthenticated: false,
  isLoading: true,
  expiresAt: null,

  setToken: (token) => {
    if (!token) {
      set({
        token: '',
        firstName: '',
        lastName: '',
        id: '',
        email: '',
        dateOfBirth: null,
        isAuthenticated: false,
        expiresAt: null,
      });
      return;
    }

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      set({
        token,
        firstName: decoded.firstName || '',
        lastName: decoded.lastName || '',
        id: decoded.id || '',
        email: decoded.email || '',
        dateOfBirth: decoded.dateOfBirth || null,
        isAuthenticated: true,
        expiresAt: decoded.exp * 1000,
      });
    } catch (error) {
      console.error('Error decoding JWT token:', error);
      set({
        token: '',
        firstName: '',
        lastName: '',
        id: '',
        email: '',
        dateOfBirth: null,
        isAuthenticated: false,
        expiresAt: null,
      });
    }
  },

  clearAuth: () => {
    set({
      token: '',
      firstName: '',
      lastName: '',
      id: '',
      email: '',
      dateOfBirth: null,
      isAuthenticated: false,
      expiresAt: null,
    });
  },

  login: async (email, password) => {
    try {
      const response = await loginApi(email, password);
      if (response.accessToken) {
        get().setToken(response.accessToken);
        return;
      }
      throw new Error('No access token returned');
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      await logoutApi();
      get().clearAuth();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
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
    } catch (error) {
      console.error('Auth check error:', error);
      get().clearAuth();
      set({ isLoading: false });
      return false;
    }
  },

  updateProfile: async (firstName, lastName, email, dateOfBirth) => {
    try {
      const id = get().id;
      const token = get().token;

      if (!id) {
        throw new Error('User not authenticated');
      }

      await updateProfileApi(id, firstName, lastName, email, dateOfBirth, token);

      set({
        firstName: firstName,
        lastName: lastName,
        email: email,
        dateOfBirth: dateOfBirth,
      });

      await get().checkAuth();
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  },
}));
