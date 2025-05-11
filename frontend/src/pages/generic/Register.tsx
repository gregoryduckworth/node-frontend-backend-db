import { useState, useEffect, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { register as registerApi } from '@/features/auth/authApi';
import { useNotificationStore } from '@/features/notification/useNotificationStore';
import { NotificationType } from '@/features/notification/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import GenericLayout from '@/components/layouts/GenericLayout';
import useTitle from '@/hooks/use-title';

const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);
  const [passwordMatchError, setPasswordMatchError] = useState(false);

  const navigate = useNavigate();
  const { addNotification } = useNotificationStore();
  const { t } = useTranslation();
  useTitle('register.title');

  useEffect(() => {
    if (passwordTouched) {
      validatePassword(password);
    }
  }, [password, passwordTouched]);

  useEffect(() => {
    if (password || confirmPassword) {
      setPasswordMatchError(password !== confirmPassword);
    }
  }, [password, confirmPassword]);

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
    setConfirmPasswordTouched(true);
    if (!isPasswordValid) {
      return;
    }
    if (password !== confirmPassword) {
      addNotification(t('validation.passwordMatch'), NotificationType.ERROR);
      return;
    }

    setIsSubmitting(true);

    try {
      await registerApi(firstName, lastName, email, password, confirmPassword);
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
      <form onSubmit={handleRegister} data-testid="register-form">
        <div className="grid gap-3">
          <Label htmlFor="firstName">{t('auth.firstName')}</Label>
          <Input
            id="firstName"
            placeholder={t('auth.firstNamePlaceholder')}
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            data-testid="first-name-input"
          />
        </div>
        <div className="grid gap-3 mt-6">
          <Label htmlFor="lastName">{t('auth.lastName')}</Label>
          <Input
            id="lastName"
            placeholder={t('auth.lastNamePlaceholder')}
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            data-testid="last-name-input"
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
            data-testid="email-input"
          />
        </div>
        <div className="grid gap-3 mt-6">
          <Label htmlFor="password">{t('auth.password')}</Label>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (!passwordTouched) setPasswordTouched(true);
            }}
            onBlur={() => setPasswordTouched(true)}
            className={passwordTouched && passwordErrors.length > 0 ? 'border-red-500' : ''}
            data-testid="password-input"
          />
          {passwordTouched && passwordErrors.length > 0 && (
            <div className="text-red-500 text-sm mt-1" data-testid="password-errors">
              <ul className="list-disc pl-5">
                {passwordErrors.map((error, index) => (
                  <li key={index} data-testid={`password-error-${index}`}>
                    {error}
                  </li>
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
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (!confirmPasswordTouched) setConfirmPasswordTouched(true);
            }}
            onBlur={() => setConfirmPasswordTouched(true)}
            className={passwordMatchError && confirmPassword ? 'border-red-500' : ''}
            data-testid="confirm-password-input"
          />
          {passwordMatchError && confirmPassword && (
            <div className="text-red-500 text-sm mt-1" data-testid="password-match-error">
              {t('validation.passwordMatch')}
            </div>
          )}
        </div>
        <Button
          type="submit"
          className="w-full mt-6"
          disabled={isSubmitting || passwordErrors.length > 0 || passwordMatchError}
          data-testid="register-button"
        >
          {isSubmitting ? t('common.loading') : t('auth.register')}
        </Button>
        <div className="text-center text-sm mt-6">
          {t('auth.alreadyHaveAccount')}{' '}
          <Link to="/login" className="underline underline-offset-4" data-testid="login-link">
            {t('auth.login')}
          </Link>
        </div>
      </form>
    </GenericLayout>
  );
};

export default Register;
