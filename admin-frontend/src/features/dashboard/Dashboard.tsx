import AuthenticatedLayout from '@/components/layouts/AuthenticatedLayout';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import useTitle from '@/hooks/use-title';
import { useTranslation } from 'react-i18next';
import { apiClient } from '@/api/apiClient';
import { API_ENDPOINTS } from '@/config/auth';
import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';

const Dashboard = () => {
  const { firstName, lastName, isLoading } = useAuthStore();
  const { t } = useTranslation();
  useTitle('dashboard.title');

  // User count state
  const [userCount, setUserCount] = useState<number | null>(null);
  const [userCountLoading, setUserCountLoading] = useState(true);
  const [userCountError, setUserCountError] = useState<string | null>(null);

  useEffect(() => {
    apiClient<{ users: { id: string }[] }>(API_ENDPOINTS.LIST_USERS, { includeCredentials: true })
      .then((data) => {
        setUserCount(Array.isArray(data.users) ? data.users.length : 0);
        setUserCountLoading(false);
      })
      .catch(() => {
        setUserCountError('Failed to load user count');
        setUserCountLoading(false);
      });
  }, []);

  return (
    <AuthenticatedLayout
      breadcrumbs={[{ label: t('dashboard.title'), href: '/dashboard', current: true }]}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <Card className="flex flex-row items-center gap-4 p-4">
          <div className="bg-primary/10 text-primary rounded-full p-3">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold">
              {userCountLoading ? t('common.loading') : userCountError ? '—' : userCount}
            </div>
            <div className="text-muted-foreground text-xs">{t('users.all')}</div>
          </div>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle data-testid="dashboard-title">
            {isLoading ? t('common.loading') : t('dashboard.welcome', { firstName, lastName })}
          </CardTitle>
        </CardHeader>
        <CardContent>Dashboard Content</CardContent>
      </Card>
    </AuthenticatedLayout>
  );
};

export default Dashboard;
