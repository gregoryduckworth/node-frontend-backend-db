import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { requestPasswordReset } from '../../api/auth';
import { useNotificationStore } from '../../store/useNotificationStore';
import { NotificationType } from '../../types/notification';
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
        NotificationType.ERROR
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendAgain = () => {
    setTimeout(() => {
      setIsSuccess(false);
    }, 100);
  };

  return (
    <GenericLayout title={t('auth.forgotPassword')} subtitle={t('auth.enterEmailReset')}>
      <form onSubmit={handleSubmit}>
        {!isSuccess && (
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
        )}

        {!isSuccess ? (
          <Button type="submit" className="w-full mt-6" disabled={isSubmitting}>
            {isSubmitting ? t('common.loading') : t('auth.resetPassword')}
          </Button>
        ) : (
          <Button type="button" className="w-full mt-6" onClick={handleSendAgain}>
            {t('auth.sendAgain')}
          </Button>
        )}

        <div className="text-center text-sm mt-6">
          {t('auth.rememberPassword')}{' '}
          <Link to="/login" className="underline underline-offset-4">
            {t('auth.backToLogin')}
          </Link>
        </div>
      </form>
    </GenericLayout>
  );
};

export default ForgotPassword;
