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
  userName: string;
  userEmail: string;
  exp: number;
  [key: string]: any;
}

interface AuthState {
  token: string;
  userName: string;
  userId: string;
  userEmail: string;
  isAuthenticated: boolean;
  isLoading: boolean;
  expiresAt: number | null;

  setToken: (token: string) => void;
  clearAuth: () => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  updateProfile: (name: string, email: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: '',
  userName: '',
  userId: '',
  userEmail: '',
  isAuthenticated: false,
  isLoading: true,
  expiresAt: null,

  setToken: (token) => {
    if (!token) {
      set({
        token: '',
        userName: '',
        userId: '',
        userEmail: '',
        isAuthenticated: false,
        expiresAt: null,
      });
      return;
    }

    try {
      const decoded = jwt_decode<JwtPayload>(token);
      set({
        token,
        userName: decoded.userName || '',
        userId: decoded.userId || '',
        userEmail: decoded.userEmail || '',
        isAuthenticated: true,
        expiresAt: decoded.exp * 1000,
      });
    } catch (error) {
      console.error('Error decoding JWT token:', error);
      set({
        token: '',
        userName: '',
        userId: '',
        userEmail: '',
        isAuthenticated: false,
        expiresAt: null,
      });
    }
  },

  clearAuth: () => {
    set({
      token: '',
      userName: '',
      userId: '',
      userEmail: '',
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

  updateProfile: async (name, email) => {
    try {
      const userId = get().userId;
      const token = get().token;

      if (!userId) {
        throw new Error('User not authenticated');
      }

      await updateProfileApi(userId, name, email, token);

      set({
        userName: name,
        userEmail: email,
      });

      await get().checkAuth();
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  },
}));
