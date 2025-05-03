import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/useAuthStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { NotificationType } from '@/types/notification';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import GenericLayout from '@/components/layouts/GenericLayout';
import useTitle from '@/hooks/use-title';

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
      addNotification(t('auth.loginSuccess'), NotificationType.SUCCESS);
      navigate('/dashboard');
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || t('auth.genericError');
      addNotification(errorMessage, NotificationType.ERROR);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <GenericLayout title={t('auth.login')} subtitle={t('app.description')}>
      <form onSubmit={handleLogin}>
        <div className="grid gap-3">
          <Label htmlFor="email">{t('auth.email')}</Label>
          <Input
            id="email"
            type="email"
            placeholder="email@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="grid gap-3 mt-4">
          <Label htmlFor="password">{t('auth.password')}</Label>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-sm underline-offset-2 hover:underline">
              {t('auth.forgotPassword')}
            </Link>
          </div>
        </div>
        <Button type="submit" className="w-full mt-6" disabled={isSubmitting}>
          {isSubmitting ? t('common.loading') : t('auth.login')}
        </Button>
        <div className="text-center text-sm mt-6">
          {t('auth.dontHaveAccount')}{' '}
          <Link to="/register" className="underline underline-offset-4">
            {t('auth.register')}
          </Link>
        </div>
      </form>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        {t('auth.termsNotice')} <a href="#">{t('auth.termsOfService')}</a> {t('common.and')}{' '}
        <a href="#">{t('auth.privacyPolicy')}</a>.
      </div>
    </GenericLayout>
  );
};

export default Login;
