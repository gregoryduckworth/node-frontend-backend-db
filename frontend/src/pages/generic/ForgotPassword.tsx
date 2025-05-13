import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { requestPasswordReset } from '@/features/auth/authApi';
import { useNotificationStore } from '@/features/notification/useNotificationStore';
import { NotificationType } from '@/features/notification/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import GenericLayout from '@/components/layouts/GenericLayout';
import useTitle from '@/hooks/use-title';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { addNotification } = useNotificationStore();
  const { t } = useTranslation();
  const navigate = useNavigate();

  useTitle('forgotPassword.title');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await requestPasswordReset(email);
      setIsSuccess(true);
      addNotification(t('auth.passwordResetRequest'), NotificationType.SUCCESS);
    } catch (error: any) {
      setIsSuccess(false);
      addNotification(
        error?.response?.data?.message || t('auth.errors.serverError'),
        NotificationType.ERROR,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <GenericLayout title={t('forgotPassword.title')} subtitle={t('forgotPassword.subtitle')}>
      <form onSubmit={handleSubmit} data-testid="forgot-password-form">
        {!isSuccess ? (
          <>
            <div className="grid gap-3">
              <Label htmlFor="email">{t('auth.email')}</Label>
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
            <Button
              type="submit"
              className="w-full mt-6"
              disabled={isSubmitting}
              data-testid="submit-button"
            >
              {isSubmitting ? t('common.loading') : t('forgotPassword.resetPassword')}
            </Button>
          </>
        ) : (
          <div className="text-center" data-testid="success-message">
            <p className="text-green-600 mb-4">{t('forgotPassword.successMessage')}</p>
            <p className="text-muted-foreground mb-6">{t('forgotPassword.checkEmailMessage')}</p>
            <Button
              type="button"
              onClick={() => navigate('/login')}
              variant="outline"
              className="w-full"
              data-testid="back-to-login-button"
            >
              {t('auth.backToLogin')}
            </Button>
          </div>
        )}

        <div className="text-center text-sm mt-6">
          <Link
            to="/login"
            className="text-primary underline underline-offset-4"
            data-testid="login-link"
          >
            {t('auth.backToLogin')}
          </Link>
        </div>
      </form>
    </GenericLayout>
  );
};

export default ForgotPassword;
