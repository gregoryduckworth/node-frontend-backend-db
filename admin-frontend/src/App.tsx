import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from '@/pages/generic/Login';
import Dashboard from '@/pages/authenticated/Dashboard';
import ForgotPassword from '@/pages/generic/ForgotPassword';
import ResetPassword from '@/pages/generic/ResetPassword';
import Profile from '@/pages/authenticated/Profile';
import { Toaster } from '@/components/ui/sonner';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { ROUTES } from '@/config/auth';
import { ErrorBoundary } from '@/components/ErrorBoundary';

type ProtectedRouteProps = {
  children: React.ReactNode;
};

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace />;

  return <>{children}</>;
};

const App = () => {
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
          <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
