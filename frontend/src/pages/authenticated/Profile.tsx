import { useState } from 'react';
import AuthenticatedLayout from '@/components/layouts/AuthenticatedLayout';
import { useAuthStore } from '../../store/useAuthStore';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTitle } from '@/hooks/use-title';
import { useTranslation } from 'react-i18next';
import { NotificationType } from '../../types/notification';
import { useNotificationStore } from '@/store/useNotificationStore';

const Profile = () => {
  const { userFirstName, userLastName, userEmail, userDateOfBirth, isLoading, updateProfile } =
    useAuthStore();
  const { addNotification } = useNotificationStore();
  const { t } = useTranslation();
  useTitle('profile.title');

  // Form state
  const [firstName, setFirstName] = useState(userFirstName);
  const [lastName, setLastName] = useState(userLastName);
  const [email, setEmail] = useState(userEmail);
  const [dateOfBirth, setDateOfBirth] = useState(userDateOfBirth || '');
  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    dateOfBirth?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Validation function
  const validateForm = () => {
    const newErrors: {
      firstName?: string;
      lastName?: string;
      email?: string;
      dateOfBirth?: string;
    } = {};
    let isValid = true;

    if (!firstName.trim()) {
      newErrors.firstName = t('validation.firstNameRequired');
      isValid = false;
    }

    if (!lastName.trim()) {
      newErrors.lastName = t('validation.lastNameRequired');
      isValid = false;
    }

    if (!email.trim()) {
      newErrors.email = t('validation.emailRequired');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t('validation.invalidEmail');
      isValid = false;
    }

    if (dateOfBirth && isNaN(Date.parse(dateOfBirth))) {
      newErrors.dateOfBirth = t('validation.invalidDate');
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      await updateProfile(firstName, lastName, email, dateOfBirth || null);
      addNotification(t('profile.profileUpdated'), NotificationType.SUCCESS);
      setIsEditMode(false);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message;
      if (errorMessage === 'Email already exists') {
        addNotification(t('validation.emailExists'), NotificationType.ERROR);
        setErrors({ ...errors, email: t('validation.emailExists') });
      } else {
        addNotification(t('profile.updateError'), NotificationType.ERROR);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFirstName(userFirstName);
    setLastName(userLastName);
    setEmail(userEmail);
    setDateOfBirth(userDateOfBirth || '');
    setErrors({});
    setIsEditMode(false);
  };

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return '';
    }
  };

  return (
    <AuthenticatedLayout
      breadcrumbs={[{ label: t('profile.title'), href: '/profile', current: true }]}
    >
      <Card>
        <CardHeader>
          <CardTitle>{t('profile.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>{t('common.loading')}</p>
          ) : isEditMode ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">{t('auth.firstName')}</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder={t('auth.firstNamePlaceholder')}
                  className={errors.firstName ? 'border-red-500' : ''}
                />
                {errors.firstName && <p className="text-sm text-red-500">{errors.firstName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">{t('auth.lastName')}</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder={t('auth.lastNamePlaceholder')}
                  className={errors.lastName ? 'border-red-500' : ''}
                />
                {errors.lastName && <p className="text-sm text-red-500">{errors.lastName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('auth.emailPlaceholder')}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">{t('auth.dateOfBirth')}</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={dateOfBirth ? dateOfBirth.substring(0, 10) : ''}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  placeholder={t('auth.dateOfBirthPlaceholder')}
                  className={errors.dateOfBirth ? 'border-red-500' : ''}
                />
                {errors.dateOfBirth && <p className="text-sm text-red-500">{errors.dateOfBirth}</p>}
              </div>
            </form>
          ) : (
            <div>
              <h2 className="mb-4 text-lg font-semibold">{t('profile.personalInfo')}</h2>
              <div className="space-y-2">
                <p>
                  <strong>{t('auth.firstName')}:</strong> {userFirstName}
                </p>
                <p>
                  <strong>{t('auth.lastName')}:</strong> {userLastName}
                </p>
                <p>
                  <strong>{t('auth.email')}:</strong> {userEmail}
                </p>
                <p>
                  <strong>{t('auth.dateOfBirth')}:</strong>{' '}
                  {userDateOfBirth ? (
                    formatDate(userDateOfBirth)
                  ) : (
                    <span className="text-amber-600 font-medium">
                      {t('profile.dateOfBirthNeeded')}
                    </span>
                  )}
                </p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          {isEditMode ? (
            <div className="flex gap-2">
              <Button type="submit" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? t('common.saving') : t('common.save')}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                {t('common.cancel')}
              </Button>
            </div>
          ) : (
            <Button onClick={() => setIsEditMode(true)}>{t('profile.editProfile')}</Button>
          )}
        </CardFooter>
      </Card>
    </AuthenticatedLayout>
  );
};

export default Profile;
