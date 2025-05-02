import AuthenticatedLayout from '@/components/layouts/AuthenticatedLayout';
import { useAuthStore } from '../store/useAuthStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useTitle } from '@/hooks/use-title';
import { useTranslation } from 'react-i18next';

const Dashboard = () => {
  const { userName, isLoading } = useAuthStore();
  const { t } = useTranslation();
  useTitle('dashboard.title');

  return (
    <AuthenticatedLayout
      breadcrumbs={[{ label: t('dashboard.title'), href: '/dashboard', current: true }]}
    >
      <Card>
        <CardHeader>
          <CardTitle>
            {isLoading ? t('common.loading') : t('dashboard.welcome', { name: userName })}
          </CardTitle>
        </CardHeader>
        <CardContent>Dashboard Content</CardContent>
      </Card>
    </AuthenticatedLayout>
  );
};

export default Dashboard;
