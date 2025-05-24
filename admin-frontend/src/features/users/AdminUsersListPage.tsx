import { useEffect, useState } from 'react';
import { apiClient } from '@/api/apiClient';
import AuthenticatedLayout from '@/components/layouts/AuthenticatedLayout';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { API_ENDPOINTS } from '@/config/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import useTitle from '@/hooks/use-title';
import { AdminUserWithRoles } from './adminTypes';
import { useNotificationStore } from '@/features/notification/useNotificationStore';
import { NotificationType } from '@/features/notification/types';

const AdminUsersListPage = () => {
  const [admins, setAdmins] = useState<AdminUserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();
  const { addNotification } = useNotificationStore();
  useTitle('adminUsers.title');

  useEffect(() => {
    apiClient<{ admins: AdminUserWithRoles[] }>(API_ENDPOINTS.ADMIN_USERS, {
      includeCredentials: true,
    })
      .then((data) => {
        setAdmins(data.admins);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load admin users');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (error) {
      addNotification(error, NotificationType.ERROR);
    }
  }, [error, addNotification]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-40">
        <span className="text-muted-foreground">{t('common.loading')}</span>
      </div>
    );
  if (error) return null;

  return (
    <AuthenticatedLayout
      breadcrumbs={[
        { label: t('adminUsers.title', 'Admin Users'), href: '/admin-users', current: true },
      ]}
    >
      <Card>
        <CardHeader>
          <CardTitle data-testid="admin-users-title">
            {t('adminUsers.all', 'All Admin Users')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {admins.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              {t('adminUsers.noResults', 'No admin users found.')}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('users.id')}</TableHead>
                  <TableHead>{t('users.firstName')}</TableHead>
                  <TableHead>{t('users.lastName')}</TableHead>
                  <TableHead>{t('users.email')}</TableHead>
                  <TableHead>{t('users.createdAt')}</TableHead>
                  <TableHead>{t('adminUsers.roles', 'Roles')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell>{admin.id}</TableCell>
                    <TableCell>{admin.firstName}</TableCell>
                    <TableCell>{admin.lastName}</TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>
                      {admin.createdAt ? new Date(admin.createdAt).toLocaleString() : ''}
                    </TableCell>
                    <TableCell>
                      {admin.roles && admin.roles.length > 0
                        ? admin.roles.map((role) => role.name).join(', ')
                        : t('adminUsers.noRoles', 'No roles')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </AuthenticatedLayout>
  );
};

export default AdminUsersListPage;
