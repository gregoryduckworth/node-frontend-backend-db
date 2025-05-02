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
  const { userName, userEmail, isLoading, updateProfile } = useAuthStore();
  const { addNotification } = useNotificationStore();
  const { t } = useTranslation();
  useTitle('profile.title');

  // Form state
  const [name, setName] = useState(userName);
  const [email, setEmail] = useState(userEmail);
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Validation function
  const validateForm = () => {
    const newErrors: { name?: string; email?: string } = {};
    let isValid = true;

    if (!name.trim()) {
      newErrors.name = t('validation.nameRequired');
      isValid = false;
    }

    if (!email.trim()) {
      newErrors.email = t('validation.emailRequired');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t('validation.invalidEmail');
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
      await updateProfile(name, email);
      addNotification(t('profile.profileUpdated'), NotificationType.SUCCESS);
      setIsEditMode(false);
    } catch (error: any) {
      addNotification(t('profile.updateError'), NotificationType.ERROR);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setName(userName);
    setEmail(userEmail);
    setErrors({});
    setIsEditMode(false);
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
                <Label htmlFor="name">{t('auth.name')}</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('auth.namePlaceholder')}
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
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
            </form>
          ) : (
            <div>
              <h2 className="mb-4 text-lg font-semibold">{t('profile.personalInfo')}</h2>
              <div className="space-y-2">
                <p>
                  <strong>{t('auth.name')}:</strong> {userName}
                </p>
                <p>
                  <strong>{t('auth.email')}:</strong> {userEmail}
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
