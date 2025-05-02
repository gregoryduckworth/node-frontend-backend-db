import { create } from 'zustand';
import jwt_decode from 'jwt-decode';
import {
  refreshToken,
  login as loginApi,
  logout as logoutApi,
  updateProfile as updateProfileApi,
} from '../api/auth';

interface JwtPayload {
  userId: string;
  userFirstName: string;
  userLastName: string;
  userEmail: string;
  exp: number;
  [key: string]: any;
}

interface AuthState {
  token: string;
  userFirstName: string;
  userLastName: string;
  userId: string;
  userEmail: string;
  userDateOfBirth: string | null;
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
  userFirstName: '',
  userLastName: '',
  userId: '',
  userEmail: '',
  userDateOfBirth: null,
  isAuthenticated: false,
  isLoading: true,
  expiresAt: null,

  setToken: (token) => {
    if (!token) {
      set({
        token: '',
        userFirstName: '',
        userLastName: '',
        userId: '',
        userEmail: '',
        userDateOfBirth: null,
        isAuthenticated: false,
        expiresAt: null,
      });
      return;
    }

    try {
      const decoded = jwt_decode<JwtPayload>(token);
      set({
        token,
        userFirstName: decoded.userFirstName || '',
        userLastName: decoded.userLastName || '',
        userId: decoded.userId || '',
        userEmail: decoded.userEmail || '',
        userDateOfBirth: decoded.userDateOfBirth || null,
        isAuthenticated: true,
        expiresAt: decoded.exp * 1000,
      });
    } catch (error) {
      console.error('Error decoding JWT token:', error);
      set({
        token: '',
        userFirstName: '',
        userLastName: '',
        userId: '',
        userEmail: '',
        userDateOfBirth: null,
        isAuthenticated: false,
        expiresAt: null,
      });
    }
  },

  clearAuth: () => {
    set({
      token: '',
      userFirstName: '',
      userLastName: '',
      userId: '',
      userEmail: '',
      userDateOfBirth: null,
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
      const response = await refreshToken();
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
      const userId = get().userId;
      const token = get().token;

      if (!userId) {
        throw new Error('User not authenticated');
      }

      await updateProfileApi(userId, firstName, lastName, email, dateOfBirth, token);

      set({
        userFirstName: firstName,
        userLastName: lastName,
        userEmail: email,
        userDateOfBirth: dateOfBirth,
      });

      await get().checkAuth();
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  },
}));
