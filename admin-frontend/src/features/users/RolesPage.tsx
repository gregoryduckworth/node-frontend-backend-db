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
import { Role, Permission } from './types';

const RolesPage = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editRoleId, setEditRoleId] = useState<string | null>(null);
  const [editPermissions, setEditPermissions] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingSaveRoleId, setPendingSaveRoleId] = useState<string | null>(null);
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
      .catch((err) => {
        let message = 'Failed to load roles or permissions';
        if (err && typeof err === 'object') {
          if ('response' in err && err.response && typeof err.response === 'object') {
            const resp = err.response as { data?: { message?: string } };
            if (resp.data && typeof resp.data.message === 'string') {
              message = resp.data.message;
            }
          } else if (
            'message' in err &&
            typeof (err as Record<string, unknown>).message === 'string'
          ) {
            message = (err as Record<string, string>).message;
          }
        }
        setError(message);
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
    setSaving(true);
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
    } catch (err: unknown) {
      let message = 'Failed to update permissions';
      if (err && typeof err === 'object') {
        if ('response' in err && err.response && typeof err.response === 'object') {
          const resp = err.response as { data?: { message?: string } };
          if (resp.data && typeof resp.data.message === 'string') {
            message = resp.data.message;
          }
        } else if (
          'message' in err &&
          typeof (err as Record<string, unknown>).message === 'string'
        ) {
          message = (err as Record<string, string>).message;
        }
      }
      addNotification(message, NotificationType.ERROR);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveClick = (roleId: string) => {
    const role = roles.find((r) => r.id === roleId);
    if (role && isCriticalRole(role)) {
      setPendingSaveRoleId(roleId);
      setShowConfirm(true);
    } else {
      savePermissions(roleId);
    }
  };

  const confirmSave = () => {
    if (pendingSaveRoleId) {
      savePermissions(pendingSaveRoleId);
      setShowConfirm(false);
      setPendingSaveRoleId(null);
    }
  };

  const cancelSave = () => {
    setShowConfirm(false);
    setPendingSaveRoleId(null);
  };

  // Helper to check if a role is critical (SUPERADMIN or ADMIN)
  const isCriticalRole = (role: Role) => ['SUPERADMIN', 'ADMIN'].includes(role.name);

  // Helper to check if a role is SUPERADMIN
  const isSuperadminRole = (role: Role) => role.name === 'SUPERADMIN';

  if (loading)
    return (
      <div className="flex justify-center items-center h-40">
        <span className="text-muted-foreground">{t('common.loading')}</span>
      </div>
    );
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <AuthenticatedLayout breadcrumbs={[{ label: t('roles.title'), href: '/roles', current: true }]}>
      <Card>
        <CardHeader>
          <CardTitle>{t('roles.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('roles.name')}</TableHead>
                <TableHead>{t('roles.description')}</TableHead>
                <TableHead>{t('roles.permissions')}</TableHead>
                <TableHead>{t('roles.permissionCount')}</TableHead>
                <TableHead>{t('roles.admins')}</TableHead>
                <TableHead>{t('roles.critical')}</TableHead>
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
                      ? role.permissions
                          .map((p) => `${p.name}${p.description ? ` (${p.description})` : ''}`)
                          .join(', ')
                      : t('roles.noPermissions')}
                  </TableCell>
                  <TableCell>{role.permissions ? role.permissions.length : 0}</TableCell>
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
                      <span className="text-muted-foreground text-xs">{t('roles.noAdmins')}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {role.critical === true ? (
                      <span
                        title={t('roles.criticalRole')}
                        className="text-green-600 font-bold text-lg"
                        aria-label={t('roles.criticalRole')}
                      >
                        ✓
                      </span>
                    ) : (
                      <span
                        title={t('roles.notCriticalRole')}
                        className="text-gray-400 text-lg"
                        aria-label={t('roles.notCriticalRole')}
                      >
                        –
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <button
                      className="px-2 py-1 bg-primary text-white rounded disabled:opacity-50"
                      onClick={() => openEdit(role)}
                      disabled={isSuperadminRole(role)}
                      title={isSuperadminRole(role) ? t('roles.superadminEditDisabled') : ''}
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
                  {t('roles.editPermissions')} {roles.find((r) => r.id === editRoleId)?.name}
                </h2>
                {isCriticalRole(roles.find((r) => r.id === editRoleId) as Role) && (
                  <div className="mb-4 p-2 bg-yellow-100 text-yellow-800 rounded text-sm">
                    {t('roles.criticalRoleWarning')}
                  </div>
                )}
                <div className="mb-4 max-h-48 overflow-y-auto">
                  {permissions.map((perm) => (
                    <label key={perm.name} className="block mb-2">
                      <input
                        type="checkbox"
                        checked={editPermissions.includes(perm.name)}
                        onChange={() => handlePermissionChange(perm.name)}
                        className="mr-2"
                        disabled={isSuperadminRole(roles.find((r) => r.id === editRoleId) as Role)}
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
                    className="px-3 py-1 rounded bg-primary text-white disabled:opacity-50 flex items-center gap-2"
                    onClick={() => handleSaveClick(editRoleId)}
                    disabled={
                      saving ||
                      isSuperadminRole(roles.find((r) => r.id === editRoleId) as Role) ||
                      editPermissions.length === 0
                    }
                  >
                    {saving && (
                      <span className="loader border-white border-t-transparent mr-2 inline-block w-4 h-4 rounded-full animate-spin"></span>
                    )}
                    {t('common.save')}
                  </button>
                </div>
              </div>
            </div>
          )}
          {showConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded shadow-lg p-6 min-w-[320px]">
                <h2 className="text-lg font-bold mb-4">{t('roles.confirmCriticalSave')}</h2>
                <div className="flex gap-2 justify-end">
                  <button className="px-3 py-1 rounded bg-muted" onClick={cancelSave}>
                    {t('common.cancel')}
                  </button>
                  <button
                    className="px-3 py-1 rounded bg-destructive text-white"
                    onClick={confirmSave}
                  >
                    {t('common.confirm')}
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
