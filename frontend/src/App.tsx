import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Register from '@/pages/generic/Register';
import Login from '@/pages/generic/Login';
import Dashboard from '@/pages/authenticated/Dashboard';
import ForgotPassword from '@/pages/generic/ForgotPassword';
import ResetPassword from '@/pages/generic/ResetPassword';
import Profile from '@/pages/authenticated/Profile';
import { Toaster } from '@/components/ui/sonner';
import { useAuthStore } from '@/store/useAuthStore';
import { ROUTES } from '@/config/auth';
import { ErrorBoundary } from '@/components/ErrorBoundary';

type ProtectedRouteProps = {
  children: React.ReactNode;
};

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      checkAuth();
    }
  }, [isAuthenticated, isLoading, checkAuth]);

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
          <Route path={ROUTES.REGISTER} element={<Register />} />
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
          <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
