import { useEffect, useState } from 'react';
import { ColumnDef, CellContext } from '@tanstack/react-table';
import { apiClient } from '../../api/apiClient';
import AuthenticatedLayout from '@/components/layouts/AuthenticatedLayout';
import { API_ENDPOINTS } from '@/config/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { useTranslation } from 'react-i18next';
import useTitle from '@/hooks/use-title';
import type { User } from './types';
import { useNotificationStore } from '@/features/notification/useNotificationStore';
import { NotificationType } from '@/features/notification/types';

const UsersListPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();
  const { addNotification } = useNotificationStore();
  useTitle('users.title');

  useEffect(() => {
    apiClient<{ users: User[] }>(API_ENDPOINTS.LIST_USERS)
      .then((data) => {
        setUsers(data.users);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load users');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (error) {
      addNotification(error, NotificationType.ERROR);
    }
  }, [error, addNotification]);

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'id',
      header: t('users.id'),
      cell: ({ row }: CellContext<User, unknown>) => {
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
      cell: ({ row }: CellContext<User, unknown>) => {
        const createdAt = row.getValue('createdAt') as string;
        return createdAt ? new Date(createdAt).toLocaleString() : '';
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
      breadcrumbs={[{ label: t('users.title'), href: '/users-list', current: true }]}
    >
      <Card>
        <CardHeader>
          <CardTitle data-testid="dashboard-title">{t('users.all')}</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={users}
            searchKeys={['firstName', 'lastName', 'email']}
            searchPlaceholder={t('users.searchMultiple')}
          />
        </CardContent>
      </Card>
    </AuthenticatedLayout>
  );
};

export default UsersListPage;
