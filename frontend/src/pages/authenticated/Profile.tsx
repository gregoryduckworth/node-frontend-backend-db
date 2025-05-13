import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { useNotificationStore } from '@/features/notification/useNotificationStore';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthenticatedLayout from '@/components/layouts/AuthenticatedLayout';
import { NotificationType } from '@/features/notification/types';
import useTitle from '@/hooks/use-title';

const Profile = () => {
  const { firstName, lastName, email, dateOfBirth, isLoading, updateProfile } = useAuthStore();
  const { addNotification } = useNotificationStore();
  const { t } = useTranslation();
  useTitle('profile.title');

  // Form state
  const [formFirstName, setFormFirstName] = useState(firstName);
  const [formLastName, setFormLastName] = useState(lastName);
  const [formEmail, setFormEmail] = useState(email);
  const [formDateOfBirth, setFormDateOfBirth] = useState(dateOfBirth || '');
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

    if (!formFirstName.trim()) {
      newErrors.firstName = t('validation.firstNameRequired');
      isValid = false;
    }

    if (!formLastName.trim()) {
      newErrors.lastName = t('validation.lastNameRequired');
      isValid = false;
    }

    if (!formEmail.trim()) {
      newErrors.email = t('validation.emailRequired');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formEmail)) {
      newErrors.email = t('validation.invalidEmail');
      isValid = false;
    }

    if (formDateOfBirth && isNaN(Date.parse(formDateOfBirth))) {
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
      await updateProfile(formFirstName, formLastName, formEmail, formDateOfBirth || null);
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
    setFormFirstName(firstName);
    setFormLastName(lastName);
    setFormEmail(email);
    setFormDateOfBirth(dateOfBirth || '');
    setErrors({});
    setIsEditMode(false);
  };

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <AuthenticatedLayout
      breadcrumbs={[{ label: t('profile.title'), href: '/profile', current: true }]}
    >
      <Card data-testid="profile-card">
        <CardHeader>
          <CardTitle>{t('profile.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p data-testid="loading-indicator">{t('common.loading')}</p>
          ) : isEditMode ? (
            <form onSubmit={handleSubmit} className="space-y-4" data-testid="profile-edit-form">
              <div className="space-y-2">
                <Label htmlFor="firstName">{t('auth.firstName')}</Label>
                <Input
                  id="firstName"
                  value={formFirstName}
                  onChange={(e) => setFormFirstName(e.target.value)}
                  placeholder={t('auth.firstNamePlaceholder')}
                  className={errors.firstName ? 'border-red-500' : ''}
                  data-testid="first-name-input"
                />
                {errors.firstName && (
                  <p className="text-sm text-red-500" data-testid="first-name-error">
                    {errors.firstName}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">{t('auth.lastName')}</Label>
                <Input
                  id="lastName"
                  value={formLastName}
                  onChange={(e) => setFormLastName(e.target.value)}
                  placeholder={t('auth.lastNamePlaceholder')}
                  className={errors.lastName ? 'border-red-500' : ''}
                  data-testid="last-name-input"
                />
                {errors.lastName && (
                  <p className="text-sm text-red-500" data-testid="last-name-error">
                    {errors.lastName}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder={t('auth.emailPlaceholder')}
                  className={errors.email ? 'border-red-500' : ''}
                  data-testid="email-input"
                />
                {errors.email && (
                  <p className="text-sm text-red-500" data-testid="email-error">
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">{t('auth.dateOfBirth')}</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formDateOfBirth ? formDateOfBirth.substring(0, 10) : ''}
                  onChange={(e) => setFormDateOfBirth(e.target.value)}
                  placeholder={t('auth.dateOfBirthPlaceholder')}
                  className={errors.dateOfBirth ? 'border-red-500' : ''}
                  data-testid="date-of-birth-input"
                />
                {errors.dateOfBirth && (
                  <p className="text-sm text-red-500" data-testid="date-of-birth-error">
                    {errors.dateOfBirth}
                  </p>
                )}
              </div>
            </form>
          ) : (
            <div data-testid="profile-info">
              <h2 className="mb-4 text-lg font-semibold">{t('profile.personalInfo')}</h2>
              <div className="space-y-2">
                <p data-testid="first-name-display">
                  <strong>{t('auth.firstName')}:</strong> {firstName}
                </p>
                <p data-testid="last-name-display">
                  <strong>{t('auth.lastName')}:</strong> {lastName}
                </p>
                <p data-testid="email-display">
                  <strong>{t('auth.email')}:</strong> {email}
                </p>
                <p data-testid="date-of-birth-display">
                  <strong>{t('auth.dateOfBirth')}:</strong>{' '}
                  {dateOfBirth ? (
                    formatDate(dateOfBirth)
                  ) : (
                    <span
                      className="text-amber-600 font-medium"
                      data-testid="date-of-birth-missing"
                    >
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
              <Button
                type="submit"
                onClick={handleSubmit}
                disabled={isSubmitting}
                data-testid="save-button"
              >
                {isSubmitting ? t('common.saving') : t('common.save')}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
                data-testid="cancel-button"
              >
                {t('common.cancel')}
              </Button>
            </div>
          ) : (
            <Button onClick={() => setIsEditMode(true)} data-testid="edit-profile-button">
              {t('profile.editProfile')}
            </Button>
          )}
        </CardFooter>
      </Card>
    </AuthenticatedLayout>
  );
};

export default Profile;
