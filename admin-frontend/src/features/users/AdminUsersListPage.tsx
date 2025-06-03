import { useEffect, useState } from 'react';
import { ColumnDef, CellContext } from '@tanstack/react-table';
import { apiClient } from '@/api/apiClient';
import AuthenticatedLayout from '@/components/layouts/AuthenticatedLayout';
import { API_ENDPOINTS } from '@/config/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
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

  const columns: ColumnDef<AdminUserWithRoles>[] = [
    {
      accessorKey: 'id',
      header: t('users.id'),
      cell: ({ row }: CellContext<AdminUserWithRoles, unknown>) => {
        const id = row.getValue('id') as string;
        return <span className="font-mono text-xs">{id}</span>;
      },
    },
    {
      accessorKey: 'firstName',
      header: t('users.firstName'),
    },
    {
      accessorKey: 'lastName',
      header: t('users.lastName'),
    },
    {
      accessorKey: 'email',
      header: t('users.email'),
    },
    {
      accessorKey: 'createdAt',
      header: t('users.createdAt'),
      cell: ({ row }: CellContext<AdminUserWithRoles, unknown>) => {
        const createdAt = row.getValue('createdAt') as string;
        return createdAt ? new Date(createdAt).toLocaleString() : '';
      },
    },
    {
      accessorKey: 'roles',
      header: t('adminUsers.roles'),
      cell: ({ row }: CellContext<AdminUserWithRoles, unknown>) => {
        const admin = row.original;
        return admin.roles && admin.roles.length > 0
          ? admin.roles.map((role) => role.name).join(', ')
          : t('adminUsers.noRoles');
      },
    },
  ];

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
          <DataTable
            columns={columns}
            data={admins}
            searchKeys={['email', 'firstName', 'lastName']}
            searchPlaceholder={t('users.searchMultiple')}
          />
        </CardContent>
      </Card>
    </AuthenticatedLayout>
  );
};

export default AdminUsersListPage;
