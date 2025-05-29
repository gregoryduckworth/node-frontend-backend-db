import { useEffect, useState } from 'react';
import { apiClient } from '@/api/apiClient';
import AuthenticatedLayout from '@/components/layouts/AuthenticatedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useNotificationStore } from '@/features/notification/useNotificationStore';
import { NotificationType } from '@/features/notification/types';
import { API_ENDPOINTS } from '@/config/auth';
import { useTranslation } from 'react-i18next';

interface Permission {
  id: string;
  name: string;
  description?: string;
}

interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
  admins?: AdminUser[];
}

const RolesPage = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editRoleId, setEditRoleId] = useState<string | null>(null);
  const [editPermissions, setEditPermissions] = useState<string[]>([]);
  const { addNotification } = useNotificationStore();
  const { t } = useTranslation();

  useEffect(() => {
    Promise.all([
      apiClient<{ roles: Role[] }>(API_ENDPOINTS.ROLES),
      apiClient<{ permissions: Permission[] }>(API_ENDPOINTS.PERMISSIONS),
    ])
      .then(([rolesRes, permsRes]) => {
        setRoles(rolesRes.roles);
        setPermissions(permsRes.permissions);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load roles or permissions');
        setLoading(false);
      });
  }, []);

  const openEdit = (role: Role) => {
    setEditRoleId(role.id);
    setEditPermissions(role.permissions.map((p) => p.name));
  };

  const closeEdit = () => {
    setEditRoleId(null);
    setEditPermissions([]);
  };

  const handlePermissionChange = (permName: string) => {
    setEditPermissions((prev) =>
      prev.includes(permName) ? prev.filter((p) => p !== permName) : [...prev, permName],
    );
  };

  const savePermissions = async (roleId: string) => {
    try {
      const res = await apiClient<{ role: Role }>(
        `${API_ENDPOINTS.PATCH_ROLE_PERMISSIONS}/${roleId}/permissions`,
        {
          method: 'PATCH',
          body: { permissions: editPermissions },
        },
      );
      setRoles((prev) =>
        prev.map((r) =>
          r.id === roleId
            ? { ...r, permissions: res.role.permissions, admins: res.role.admins }
            : r,
        ),
      );
      addNotification('Permissions updated', NotificationType.SUCCESS);
      closeEdit();
    } catch {
      addNotification('Failed to update permissions', NotificationType.ERROR);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-40">
        <span className="text-muted-foreground">{t('common.loading')}</span>
      </div>
    );
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <AuthenticatedLayout
      breadcrumbs={[{ label: t('roles.title', 'Roles'), href: '/roles', current: true }]}
    >
      <Card>
        <CardHeader>
          <CardTitle>{t('roles.title', 'Roles & Permissions')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('roles.name', 'Role')}</TableHead>
                <TableHead>{t('roles.description', 'Description')}</TableHead>
                <TableHead>{t('roles.permissions', 'Permissions')}</TableHead>
                <TableHead>{t('roles.admins', 'Admins')}</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell>{role.name}</TableCell>
                  <TableCell>{role.description}</TableCell>
                  <TableCell>
                    {role.permissions && role.permissions.length > 0
                      ? role.permissions.map((p) => p.name).join(', ')
                      : t('roles.noPermissions', 'No permissions')}
                  </TableCell>
                  <TableCell>
                    {role.admins && role.admins.length > 0 ? (
                      <ul className="list-disc list-inside text-xs">
                        {role.admins.map((admin) => (
                          <li key={admin.id}>
                            {admin.firstName} {admin.lastName}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-muted-foreground text-xs">
                        {t('roles.noAdmins', 'No admins')}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <button
                      className="px-2 py-1 bg-primary text-white rounded"
                      onClick={() => openEdit(role)}
                    >
                      {t('common.edit')}
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {editRoleId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded shadow-lg p-6 min-w-[320px]">
                <h2 className="text-lg font-bold mb-4">
                  {t('roles.editPermissions', 'Edit Permissions for')}{' '}
                  {roles.find((r) => r.id === editRoleId)?.name}
                </h2>
                <div className="mb-4">
                  {permissions.map((perm) => (
                    <label key={perm.name} className="block mb-2">
                      <input
                        type="checkbox"
                        checked={editPermissions.includes(perm.name)}
                        onChange={() => handlePermissionChange(perm.name)}
                        className="mr-2"
                      />
                      {perm.name}{' '}
                      <span className="text-xs text-muted-foreground">{perm.description}</span>
                    </label>
                  ))}
                </div>
                <div className="flex gap-2 justify-end">
                  <button className="px-3 py-1 rounded bg-muted" onClick={closeEdit}>
                    {t('common.cancel')}
                  </button>
                  <button
                    className="px-3 py-1 rounded bg-primary text-white"
                    onClick={() => savePermissions(editRoleId)}
                    disabled={editPermissions.length === 0}
                  >
                    {t('common.save')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </AuthenticatedLayout>
  );
};

export default RolesPage;
