import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { useNotificationStore } from '@/features/notification/useNotificationStore';
import { NotificationType } from '@/features/notification/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import GenericLayout from '@/components/layouts/GenericLayout';
import useTitle from '@/hooks/use-title';
import { getApiErrorMessage } from '@/api/handleApiError';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useTranslation();

  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { addNotification } = useNotificationStore();
  useTitle('login.title');

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await login(email, password);
      addNotification(t('login.loginSuccess'), NotificationType.SUCCESS);
      navigate('/dashboard');
    } catch (error: unknown) {
      addNotification(getApiErrorMessage(error, t('login.genericError')), NotificationType.ERROR);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <GenericLayout title={t('login.title')} subtitle={t('app.description')}>
      <form onSubmit={handleLogin} data-testid="login-form">
        <div className="grid gap-3">
          <Label htmlFor="email">{t('login.email')}</Label>
          <Input
            id="email"
            type="email"
            placeholder="email@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            data-testid="email-input"
          />
        </div>

        <div className="grid gap-3 mt-4">
          <Label htmlFor="password">{t('login.password')}</Label>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            data-testid="password-input"
          />
          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-sm underline-offset-2 hover:underline"
              data-testid="forgot-password-link"
            >
              {t('login.forgotPassword')}
            </Link>
          </div>
        </div>
        <Button
          type="submit"
          className="w-full mt-6"
          disabled={isSubmitting}
          data-testid="login-button"
        >
          {isSubmitting ? t('common.loading') : t('login.login')}
        </Button>
        <div className="text-center text-sm mt-6">
          {t('login.backToRegister')}{' '}
          <Link to="/register" className="underline underline-offset-4" data-testid="register-link">
            {t('register.register')}
          </Link>
        </div>
      </form>
      <p className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance">
        <Trans
          i18nKey="authShared.termsNoticeFull"
          t={t}
          components={{
            a1: <a href="#" className="underline underline-offset-4" />,
            a2: <a href="#" className="underline underline-offset-4" />,
          }}
          values={{
            termsNotice: t('authShared.termsNotice'),
            termsOfService: t('authShared.termsOfService'),
            and: t('common.and'),
            privacyPolicy: t('authShared.privacyPolicy'),
          }}
        />
      </p>
    </GenericLayout>
  );
};

export default Login;
