import { useEffect, useState } from 'react';
import { apiClient } from '../../api/apiClient';
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

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}

const UsersListPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const { t } = useTranslation();
  useTitle('users.title');

  useEffect(() => {
    apiClient<{ users: User[] }>(API_ENDPOINTS.LIST_USERS, { includeCredentials: true })
      .then((data) => {
        setUsers(data.users);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load users');
        setLoading(false);
      });
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      user.firstName.toLowerCase().includes(search.toLowerCase()) ||
      user.lastName.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) return <div>Loading users...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <AuthenticatedLayout
      breadcrumbs={[{ label: t('users.title'), href: '/users-list', current: true }]}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle data-testid="dashboard-title">{t('users.all')}</CardTitle>
          <input
            type="text"
            placeholder={t('users.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-2 py-1 border rounded w-48 text-sm"
          />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('users.id')}</TableHead>
                <TableHead>{t('users.firstName')}</TableHead>
                <TableHead>{t('users.lastName')}</TableHead>
                <TableHead>{t('users.email')}</TableHead>
                <TableHead>{t('users.createdAt')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.firstName}</TableCell>
                  <TableCell>{user.lastName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {user.createdAt ? new Date(user.createdAt).toLocaleString() : ''}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AuthenticatedLayout>
  );
};

export default UsersListPage;
