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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { API_ENDPOINTS } from '@/config/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import useTitle from '@/hooks/use-title';
import { AdminUserWithRoles, AdminRole } from './adminTypes';
import { useDebounce } from '@/hooks/use-debounce';
import { useNotificationStore } from '@/features/notification/useNotificationStore';
import { NotificationType } from '@/features/notification/types';
import { useAuthStore } from '@/features/auth/useAuthStore';

const AdminUsersListPage = () => {
  const [admins, setAdmins] = useState<AdminUserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const { t } = useTranslation();
  const { addNotification } = useNotificationStore();
  const { id: currentUserId, roles: currentUserRoles } = useAuthStore();
  useTitle('adminUsers.title');

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUserWithRoles | null>(null);
  const [allRoles, setAllRoles] = useState<AdminRole[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  useEffect(() => {
    apiClient<{ admins: AdminUserWithRoles[] }>(API_ENDPOINTS.ADMIN_USERS)
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

  useEffect(() => {
    apiClient<{ roles: AdminRole[] }>(API_ENDPOINTS.ROLES)
      .then((data) => setAllRoles(data.roles))
      .catch(() => setAllRoles([]));
  }, []);

  const openRoleModal = (admin: AdminUserWithRoles) => {
    setSelectedAdmin(admin);
    setSelectedRoles(admin.roles.map((r) => r.name));
    setModalOpen(true);
  };

  const closeRoleModal = () => {
    setModalOpen(false);
    setSelectedAdmin(null);
    setSelectedRoles([]);
  };

  const handleRoleChange = (roleName: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleName) ? prev.filter((r) => r !== roleName) : [...prev, roleName],
    );
  };

  const isCurrentUserSuperadmin = currentUserRoles.includes('SUPERADMIN');

  const isSuperadminRole = (roleName: string) => roleName === 'SUPERADMIN';

  const saveRoles = async () => {
    if (!selectedAdmin) return;
    try {
      await apiClient(`${API_ENDPOINTS.ADMIN_USER_ROLES}/${selectedAdmin.id}/roles`, {
        method: 'PATCH',
        body: { roles: selectedRoles },
        includeCredentials: true,
      });
      addNotification('Roles updated', NotificationType.SUCCESS);
      setAdmins((prev) =>
        prev.map((a) =>
          a.id === selectedAdmin.id
            ? { ...a, roles: allRoles.filter((r) => selectedRoles.includes(r.name)) }
            : a,
        ),
      );
      closeRoleModal();
    } catch {
      addNotification('Failed to update roles', NotificationType.ERROR);
    }
  };

  const filteredAdmins = admins.filter(
    (admin) =>
      admin.firstName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      admin.lastName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      admin.email.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      admin.roles.some((role) => role.name.toLowerCase().includes(debouncedSearch.toLowerCase())),
  );

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
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle data-testid="admin-users-title">
            {t('adminUsers.all', 'All Admin Users')}
          </CardTitle>
          <input
            type="text"
            placeholder={t('adminUsers.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-2 py-1 border rounded w-48 text-sm"
          />
        </CardHeader>
        <CardContent>
          {filteredAdmins.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              {t('adminUsers.noResults')}
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
                  <TableHead>{t('adminUsers.roles')}</TableHead>
                  <TableHead>{t('adminUsers.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAdmins.map((admin) => (
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
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => openRoleModal(admin)}
                        disabled={admin.id === currentUserId}
                        title={
                          admin.id === currentUserId ? t('adminUsers.cannotEditSelf') : undefined
                        }
                      >
                        Edit Roles
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <Dialog open={modalOpen} onOpenChange={(open) => !open && closeRoleModal()}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Edit Roles for {selectedAdmin?.email}</DialogTitle>
                <DialogDescription>
                  Select the roles you want to assign to this admin user.
                </DialogDescription>
              </DialogHeader>

              <div className="max-h-48 overflow-y-auto space-y-3">
                {allRoles.map((role) => {
                  const isDisabled = isSuperadminRole(role.name) && !isCurrentUserSuperadmin;

                  return (
                    <label key={role.name} className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedRoles.includes(role.name)}
                        onChange={() => handleRoleChange(role.name)}
                        disabled={isDisabled}
                        className="mt-1"
                        title={isDisabled ? t('adminUsers.cannotAssignSuperadmin') : undefined}
                      />
                      <div className="flex-1">
                        <div className={`font-medium ${isDisabled ? 'text-gray-400' : ''}`}>
                          {role.name}
                        </div>
                        {role.description && (
                          <div
                            className={`text-xs ${isDisabled ? 'text-gray-300' : 'text-muted-foreground'}`}
                          >
                            {role.description}
                          </div>
                        )}
                        {isDisabled && (
                          <div className="text-xs text-orange-600 mt-1">
                            {t('adminUsers.cannotAssignSuperadmin')}
                          </div>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={closeRoleModal}>
                  Cancel
                </Button>
                <Button
                  onClick={saveRoles}
                  disabled={selectedRoles.length === 0}
                  className="min-w-20"
                >
                  Save
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </AuthenticatedLayout>
  );
};

export default AdminUsersListPage;
