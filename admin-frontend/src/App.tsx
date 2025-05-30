import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from '@/pages/generic/Login';
import Dashboard from '@/features/dashboard/Dashboard';
import ForgotPassword from '@/pages/generic/ForgotPassword';
import ResetPassword from '@/pages/generic/ResetPassword';
import Profile from '@/features/profile/Profile';
import { Toaster } from '@/components/ui/sonner';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { ROUTES } from '@/config/auth';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import UsersListPage from '@/features/users/UsersListPage';
import AdminUsersListPage from '@/features/users/AdminUsersListPage';
import RolesPage from '@/features/users/RolesPage';

type ProtectedRouteProps = {
  children: React.ReactNode;
};

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace />;

  return <>{children}</>;
};

const App = () => {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Toaster />
        <Routes>
          <Route path={ROUTES.LOGIN} element={<Login />} />
          <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />
          <Route path={ROUTES.RESET_PASSWORD} element={<ResetPassword />} />
          <Route
            path={ROUTES.DASHBOARD}
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.PROFILE}
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.LIST_USERS}
            element={
              <ProtectedRoute>
                <UsersListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.ADMIN_USERS}
            element={
              <ProtectedRoute>
                <AdminUsersListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.ROLES}
            element={
              <ProtectedRoute>
                <RolesPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
