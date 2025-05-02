import { useState, FormEvent, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register as registerApi } from '../../api/auth';
import { useNotificationStore } from '../../store/useNotificationStore';
import { NotificationType } from '../../types/notification';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import GenericLayout from '@/components/layouts/GenericLayout';
import useTitle from '@/hooks/use-title';
import { useTranslation } from 'react-i18next';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const navigate = useNavigate();
  const { addNotification } = useNotificationStore();
  const { t } = useTranslation();
  useTitle('register.title');

  useEffect(() => {
    if (passwordTouched) {
      validatePassword(password);
    }
  }, [password, passwordTouched]);

  const validatePassword = (password: string): boolean => {
    const errors: string[] = [];
    if (password.length < 8) {
      errors.push(t('validation.minLength', { field: t('auth.password'), min: 8 }));
    }
    if (!/[A-Z]/.test(password)) {
      errors.push(t('validation.passwordUppercase'));
    }
    if (!/\d/.test(password)) {
      errors.push(t('validation.passwordNumber'));
    }
    setPasswordErrors(errors);
    return errors.length === 0;
  };

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const isPasswordValid = validatePassword(password);
    setPasswordTouched(true);
    if (!isPasswordValid) {
      return;
    }
    if (password !== confirmPassword) {
      addNotification(t('validation.passwordMatch'), NotificationType.ERROR);
      return;
    }

    setIsSubmitting(true);

    try {
      await registerApi(name, email, password, confirmPassword);
      addNotification(t('auth.registerSuccess'), NotificationType.SUCCESS);
      navigate('/login');
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || t('auth.errors.serverError');
      addNotification(errorMessage, NotificationType.ERROR);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <GenericLayout title={t('auth.createAccount')} subtitle={t('auth.signUpForAccount')}>
      <form onSubmit={handleRegister}>
        <div className="grid gap-3">
          <Label htmlFor="name">{t('auth.name')}</Label>
          <Input
            id="name"
            placeholder={t('auth.usernamePlaceholder')}
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="grid gap-3 mt-6">
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
        <div className="grid gap-3 mt-6">
          <Label htmlFor="password">{t('auth.password')}</Label>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setPasswordTouched(true)}
            className={passwordTouched && passwordErrors.length > 0 ? 'border-red-500' : ''}
          />
          {passwordTouched && passwordErrors.length > 0 && (
            <div className="text-red-500 text-sm mt-1">
              <ul className="list-disc pl-5">
                {passwordErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="text-xs text-gray-500 mt-1">{t('validation.passwordRequirements')}</div>
        </div>
        <div className="grid gap-3 mt-6">
          <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
          <Input
            id="confirmPassword"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={password !== confirmPassword && confirmPassword ? 'border-red-500' : ''}
          />
          {password !== confirmPassword && confirmPassword && (
            <div className="text-red-500 text-sm mt-1">{t('validation.passwordMatch')}</div>
          )}
        </div>
        <Button
          type="submit"
          className="w-full mt-6"
          disabled={isSubmitting || passwordErrors.length > 0 || password !== confirmPassword}
        >
          {isSubmitting ? t('common.loading') : t('auth.register')}
        </Button>
        <div className="text-center text-sm mt-6">
          {t('auth.alreadyHaveAccount')}{' '}
          <Link to="/login" className="underline underline-offset-4">
            {t('auth.login')}
          </Link>
        </div>
      </form>
    </GenericLayout>
  );
};

export default Register;
