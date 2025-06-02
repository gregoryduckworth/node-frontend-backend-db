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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNotificationStore } from '@/features/notification/useNotificationStore';
import { NotificationType } from '@/features/notification/types';
import { API_ENDPOINTS } from '@/config/auth';
import { useTranslation } from 'react-i18next';
import { useDebounce } from '@/hooks/use-debounce';
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
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
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
      const res = await apiClient<{ role: Role }>(`${API_ENDPOINTS.ROLES}/${roleId}/permissions`, {
        method: 'PATCH',
        body: { permissions: editPermissions },
      });
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
    if (role && role.system) {
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

  const filteredRoles = roles.filter((role) => {
    if (!debouncedSearch) return true;

    const searchLower = debouncedSearch.toLowerCase();

    const nameMatch = role.name.toLowerCase().includes(searchLower);
    const descriptionMatch = role.description?.toLowerCase().includes(searchLower);

    const permissionMatch = role.permissions?.some(
      (permission) =>
        permission.name.toLowerCase().includes(searchLower) ||
        permission.description?.toLowerCase().includes(searchLower),
    );

    return nameMatch || descriptionMatch || permissionMatch;
  });

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
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>{t('roles.title')}</CardTitle>
          <Input
            placeholder={t('roles.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-2 py-1 border rounded w-48 text-sm"
          />
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
                <TableHead>{t('roles.system')}</TableHead>
                <TableHead>{t('roles.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRoles.length > 0 ? (
                filteredRoles.map((role) => (
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
                      {role.system ? (
                        <span
                          title={t('roles.systemRole')}
                          className="text-green-600 font-bold text-lg"
                          aria-label={t('roles.systemRole')}
                        >
                          ✓
                        </span>
                      ) : (
                        <span
                          title={t('roles.notSystemRole')}
                          className="text-gray-400 text-lg"
                          aria-label={t('roles.notSystemRole')}
                        >
                          -
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        onClick={() => openEdit(role)}
                        disabled={role.system}
                        size="sm"
                        title={role.system ? t('roles.systemEditDisabled') : ''}
                      >
                        {t('common.edit')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <span className="text-muted-foreground">
                      {debouncedSearch ?? t('roles.noRoles')}
                    </span>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <Dialog open={!!editRoleId} onOpenChange={(open) => !open && closeEdit()}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {t('roles.editPermissions')} {roles.find((r) => r.id === editRoleId)?.name}
                </DialogTitle>
                {(() => {
                  const editRole = roles.find((r) => r.id === editRoleId);
                  return (
                    editRole &&
                    editRole.system && (
                      <DialogDescription className="p-3 bg-yellow-50 text-yellow-800 rounded-md border border-yellow-200">
                        {t('roles.systemRoleWarning')}
                      </DialogDescription>
                    )
                  );
                })()}
              </DialogHeader>

              <div className="max-h-48 overflow-y-auto space-y-3">
                {permissions.map((perm) => {
                  const editRole = roles.find((r) => r.id === editRoleId);
                  return (
                    <label key={perm.name} className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editPermissions.includes(perm.name)}
                        onChange={() => handlePermissionChange(perm.name)}
                        className="mt-1"
                        disabled={editRole ? editRole.system : false}
                      />
                      <div className="flex-1">
                        <div className="font-medium">{perm.name}</div>
                        {perm.description && (
                          <div className="text-xs text-muted-foreground">{perm.description}</div>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={closeEdit}>
                  {t('common.cancel')}
                </Button>
                <Button
                  onClick={() => editRoleId && handleSaveClick(editRoleId)}
                  disabled={(() => {
                    const editRole = roles.find((r) => r.id === editRoleId);
                    return (
                      saving || (editRole ? editRole.system : false) || editPermissions.length === 0
                    );
                  })()}
                  className="min-w-20"
                >
                  {saving && (
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  )}
                  {t('common.save')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={showConfirm} onOpenChange={(open) => !open && cancelSave()}>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>{t('roles.confirmSystemSave')}</DialogTitle>
                <DialogDescription>{t('roles.confirmSystemSaveDescription')}</DialogDescription>
              </DialogHeader>

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={cancelSave}>
                  {t('common.cancel')}
                </Button>
                <Button variant="destructive" onClick={confirmSave}>
                  {t('common.confirm')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </AuthenticatedLayout>
  );
};

export default RolesPage;
