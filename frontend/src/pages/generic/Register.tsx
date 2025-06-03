import { useState, useEffect, FormEvent, useCallback } from 'react';
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
import { getApiErrorMessage } from '@/api/handleApiError';

const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [dateOfBirthTouched, setDateOfBirthTouched] = useState(false);
  const [dateOfBirthError, setDateOfBirthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);
  const [passwordMatchError, setPasswordMatchError] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const navigate = useNavigate();
  const { addNotification } = useNotificationStore();
  const { t } = useTranslation();
  useTitle('register.title');

  const validatePassword = useCallback(
    (password: string): boolean => {
      const errors: string[] = [];
      if (password.length < 8) {
        errors.push(t('validation.minLength', { field: t('register.password'), min: 8 }));
      }
      if (!/[A-Z]/.test(password)) {
        errors.push(t('validation.passwordUppercase'));
      }
      if (!/\d/.test(password)) {
        errors.push(t('validation.passwordNumber'));
      }
      setPasswordErrors(errors);
      return errors.length === 0;
    },
    [t],
  );

  const validateDateOfBirth = useCallback(
    (dateString: string): boolean => {
      if (!dateString) {
        setDateOfBirthError(t('validation.required', { field: t('register.dateOfBirth') }));
        return false;
      }

      const date = new Date(dateString);
      const today = new Date();

      // Check if it's a valid date
      if (isNaN(date.getTime())) {
        setDateOfBirthError(t('validation.invalidDate'));
        return false;
      }

      // Check if date is not in the future
      if (date > today) {
        setDateOfBirthError(t('validation.dateNotFuture'));
        return false;
      }

      // Check minimum age (13 years old)
      const minDate = new Date();
      minDate.setFullYear(today.getFullYear() - 13);

      if (date > minDate) {
        setDateOfBirthError(t('validation.minimumAge', { age: 13 }));
        return false;
      }

      setDateOfBirthError('');
      return true;
    },
    [t],
  );

  useEffect(() => {
    if (passwordTouched) {
      validatePassword(password);
    }
  }, [password, passwordTouched, validatePassword]);

  useEffect(() => {
    if (dateOfBirthTouched) {
      validateDateOfBirth(dateOfBirth);
    }
  }, [dateOfBirth, dateOfBirthTouched, validateDateOfBirth]);

  useEffect(() => {
    if (password || confirmPassword) {
      setPasswordMatchError(password !== confirmPassword);
    }
  }, [password, confirmPassword]);

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormSubmitted(true);
    const isPasswordValid = validatePassword(password);
    const isDateOfBirthValid = validateDateOfBirth(dateOfBirth);
    setPasswordTouched(true);
    setConfirmPasswordTouched(true);
    setDateOfBirthTouched(true);

    if (!isPasswordValid || !isDateOfBirthValid) {
      return;
    }
    if (password !== confirmPassword) {
      addNotification(t('register.validation.passwordMatch'), NotificationType.ERROR);
      return;
    }

    setIsSubmitting(true);

    try {
      await registerApi(firstName, lastName, email, password, confirmPassword, dateOfBirth);
      addNotification(t('register.registerSuccess'), NotificationType.SUCCESS);
      navigate('/login');
    } catch (error: unknown) {
      const errorMessage = getApiErrorMessage(error, t('register.errors.serverError'));
      addNotification(errorMessage, NotificationType.ERROR);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <GenericLayout title={t('register.title')} subtitle={t('register.signUpForAccount')}>
      <form onSubmit={handleRegister} data-testid="register-form">
        <div className="grid gap-3">
          <Label htmlFor="firstName">{t('register.firstName')}</Label>
          <Input
            id="firstName"
            placeholder={t('register.firstNamePlaceholder')}
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            data-testid="first-name-input"
          />
        </div>
        <div className="grid gap-3 mt-6">
          <Label htmlFor="lastName">{t('register.lastName')}</Label>
          <Input
            id="lastName"
            placeholder={t('register.lastNamePlaceholder')}
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            data-testid="last-name-input"
          />
        </div>
        <div className="grid gap-3 mt-6">
          <Label htmlFor="email">{t('register.email')}</Label>
          <Input
            id="email"
            type="email"
            placeholder={t('register.emailPlaceholder')}
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            data-testid="email-input"
          />
        </div>
        <div className="grid gap-3 mt-6">
          <Label htmlFor="dateOfBirth">{t('register.dateOfBirth')}</Label>
          <Input
            id="dateOfBirth"
            type="date"
            placeholder={t('register.dateOfBirthPlaceholder')}
            required
            value={dateOfBirth}
            onChange={(e) => {
              setDateOfBirth(e.target.value);
              if (!dateOfBirthTouched) setDateOfBirthTouched(true);
            }}
            onBlur={() => setDateOfBirthTouched(true)}
            className={dateOfBirthTouched && dateOfBirthError ? 'border-red-500' : ''}
            data-testid="date-of-birth-input"
          />
          {dateOfBirthTouched && dateOfBirthError && (
            <div className="text-xs text-red-500 mt-1" data-testid="date-of-birth-error">
              {dateOfBirthError}
            </div>
          )}
        </div>
        <div className="grid gap-3 mt-6">
          <Label htmlFor="password">{t('register.password')}</Label>
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
          <div
            className={`text-xs mt-1 ${(formSubmitted || (passwordTouched && confirmPasswordTouched)) && passwordErrors.length > 0 ? 'text-red-500 error' : 'text-gray-500'}`}
            data-testid="password-requirements"
          >
            {t('validation.passwordRequirements')}
          </div>
        </div>
        <div className="grid gap-3 mt-6">
          <Label htmlFor="confirmPassword">{t('register.confirmPassword')}</Label>
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
        </div>
        <Button
          type="submit"
          className="w-full mt-6 whitespace-normal text-center"
          disabled={
            isSubmitting ||
            passwordErrors.length > 0 ||
            passwordMatchError ||
            dateOfBirthError !== ''
          }
          data-testid="register-button"
        >
          {isSubmitting
            ? t('common.loading')
            : passwordErrors.length > 0 || passwordMatchError || dateOfBirthError !== ''
              ? t('register.passwordRequirementsNotMet')
              : t('register.register')}
        </Button>
        <div className="text-center text-sm mt-6">
          {t('register.alreadyHaveAccount')}{' '}
          <Link to="/login" className="underline underline-offset-4" data-testid="login-link">
            {t('login.login')}
          </Link>
        </div>
      </form>
    </GenericLayout>
  );
};

export default Register;
