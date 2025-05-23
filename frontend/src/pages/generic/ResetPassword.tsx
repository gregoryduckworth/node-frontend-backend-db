import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { resetPassword } from '@/features/auth/authApi';
import { useNotificationStore } from '@/features/notification/useNotificationStore';
import { NotificationType } from '@/features/notification/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import GenericLayout from '@/components/layouts/GenericLayout';
import useTitle from '@/hooks/use-title';
import { getApiErrorMessage } from '@/api/handleApiError';

const ResetPassword = () => {
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { addNotification } = useNotificationStore();
  const { t } = useTranslation();
  useTitle('resetPassword.title');

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const tokenParam = query.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    }
  }, [location]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (password !== confirmPassword) {
      addNotification(t('resetPassword.errors.passwordMatch'), NotificationType.ERROR);
      setIsSubmitting(false);
      return;
    }

    try {
      await resetPassword(token, password, confirmPassword);
      setIsSuccess(true);
      addNotification(t('resetPassword.passwordResetSuccess'), NotificationType.SUCCESS);
      navigate('/login');
    } catch (error: unknown) {
      setIsSuccess(false);
      addNotification(
        getApiErrorMessage(error, t('resetPassword.errors.serverError')),
        NotificationType.ERROR,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
        <Card className="w-full max-w-sm p-6">
          <div className="flex flex-col gap-4 text-center">
            <h1 className="text-2xl font-bold">{t('resetPassword.invalidResetLink')}</h1>
            <p className="text-muted-foreground">{t('resetPassword.linkExpired')}</p>
            <Button onClick={() => navigate('/forgot-password')}>
              {t('resetPassword.requestNewLink')}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <GenericLayout title={t('resetPassword.title')} subtitle={t('resetPassword.subtitle')}>
      <form onSubmit={handleSubmit} data-testid="reset-password-form">
        {!isSuccess ? (
          <>
            <div className="grid gap-3">
              <Label htmlFor="password">{t('resetPassword.newPassword')}</Label>
              <Input
                id="password"
                type="password"
                placeholder={t('resetPassword.enterNewPassword')}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                data-testid="password-input"
              />
            </div>

            <div className="grid gap-3 mt-6">
              <Label htmlFor="confirmPassword">{t('resetPassword.confirmNewPassword')}</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder={t('resetPassword.confirmNewPasswordPlaceholder')}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                data-testid="confirm-password-input"
              />
            </div>
          </>
        ) : null}

        {!isSuccess ? (
          <Button
            type="submit"
            className="w-full mt-6"
            disabled={isSubmitting}
            data-testid="reset-button"
          >
            {isSubmitting ? t('common.loading') : t('resetPassword.resetPassword')}
          </Button>
        ) : (
          <Button
            type="button"
            className="w-full mt-6"
            onClick={() => navigate('/login')}
            data-testid="back-to-login-button"
          >
            {t('resetPassword.backToLogin')}
          </Button>
        )}
      </form>
    </GenericLayout>
  );
};

export default ResetPassword;
