// Route paths
export const ROUTES = {
  LOGIN: '/login',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  LIST_USERS: '/users-list',
  ADMIN_USERS: '/admin-list',
  ROLES: '/roles',
};

// API endpoints
export const API_ENDPOINTS = {
  LOGIN: '/api/admin/login',
  LOGOUT: '/api/auth/logout',
  REFRESH_TOKEN: '/api/admin/token',
  FORGOT_PASSWORD: '/api/auth/forgot-password',
  RESET_PASSWORD: '/api/auth/reset-password',
  UPDATE_PROFILE: '/api/users',
  LIST_USERS: '/api/admin/users',
  ADMIN_USERS: '/api/admin/admin-users',
  ADMIN_USER_ROLES: '/api/admin/admin-users',
  ROLES: '/api/admin/roles',
  PERMISSIONS: '/api/admin/permissions',
};
