import AuthenticatedLayout from '@/components/layouts/AuthenticatedLayout';
import { useAuthStore } from '../store/useAuthStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useTitle } from '@/hooks/use-title';
import { useTranslation } from 'react-i18next';

const Profile = () => {
  const { userName, userEmail, isLoading } = useAuthStore();
  const { t } = useTranslation();
  useTitle('profile.title');

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
      </Card>
    </AuthenticatedLayout>
  );
};

export default Profile;
