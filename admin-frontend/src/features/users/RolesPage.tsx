import { useEffect, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { apiClient } from '@/api/apiClient';
import AuthenticatedLayout from '@/components/layouts/AuthenticatedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { CheckboxListDialog, CheckboxListItem } from '@/components/custom/checkbox-list-dialog';
import { ConfirmationDialog } from '@/components/custom/confirmation-dialog';
import { Button } from '@/components/ui/button';
import { useNotificationStore } from '@/features/notification/useNotificationStore';
import { NotificationType } from '@/features/notification/types';
import { API_ENDPOINTS } from '@/config/auth';
import { useTranslation } from 'react-i18next';
import { Role, Permission } from './types';
import useTitle from '@/hooks/use-title';

const SystemStatus = ({ isSystem, t }: { isSystem: boolean; t: (key: string) => string }) => {
  const label = isSystem ? 'roles.systemRole' : 'roles.notSystemRole';
  return (
    <div className="text-center">
      <span
        title={t(label)}
        className={`text-lg ${isSystem ? 'text-green-600 font-bold' : 'text-gray-400'}`}
        aria-label={t(label)}
      >
        {isSystem ? '✓' : '-'}
      </span>
    </div>
  );
};

const PermissionBadge = ({ permission }: { permission: Permission }) => (
  <li
    key={permission.name}
    className="flex flex-col items-start min-w-0"
    aria-label={`${permission.name}${permission.description ? ': ' + permission.description : ''}`}
  >
    <span className="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">{permission.name}</span>
    {permission.description && (
      <span className="text-muted-foreground text-xs break-words max-w-[12rem]">
        {permission.description}
      </span>
    )}
  </li>
);

const AdminsList = ({ admins, t }: { admins: Role['admins']; t: (key: string) => string }) => {
  if (!admins || admins.length === 0) {
    return <span className="text-muted-foreground text-xs">{t('roles.noAdmins')}</span>;
  }

  return (
    <div className="max-w-xs">
      <div className="text-xs space-y-1">
        {admins.slice(0, 3).map((admin) => (
          <div key={admin.id}>
            {admin.firstName} {admin.lastName}
          </div>
        ))}
        {admins.length > 3 && (
          <div className="text-muted-foreground">
            +{admins.length - 3} {t('roles.more')}
          </div>
        )}
      </div>
    </div>
  );
};

const getErrorMessage = (err: unknown, fallback: string): string => {
  if (err && typeof err === 'object') {
    if ('response' in err && err.response && typeof err.response === 'object') {
      const resp = err.response as { data?: { message?: string } };
      if (resp.data && typeof resp.data.message === 'string') {
        return resp.data.message;
      }
    } else if ('message' in err && typeof (err as Record<string, unknown>).message === 'string') {
      return (err as Record<string, string>).message;
    }
  }
  return fallback;
};

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
  useTitle('roles.title');

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
        setError(getErrorMessage(err, 'Failed to load roles or permissions'));
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
      addNotification(getErrorMessage(err, 'Failed to update permissions'), NotificationType.ERROR);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveClick = (roleId: string) => {
    const role = roles.find((r) => r.id === roleId);
    if (role?.system) {
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

  const columns: ColumnDef<Role>[] = [
    {
      accessorKey: 'name',
      header: t('roles.name'),
    },
    {
      accessorKey: 'description',
      header: t('roles.description'),
    },
    {
      accessorKey: 'permissions',
      header: t('roles.permissions'),
      cell: ({ row }) => {
        const { permissions } = row.original;
        return (
          <div className="flex items-center min-h-[32px]">
            {permissions?.length ? (
              <ul className="flex flex-wrap gap-2" aria-label={t('roles.permissionsList')}>
                {permissions.map((permission) => (
                  <PermissionBadge key={permission.name} permission={permission} />
                ))}
              </ul>
            ) : (
              <span className="text-muted-foreground text-xs">{t('roles.noPermissions')}</span>
            )}
          </div>
        );
      },
      meta: { className: 'hidden lg:table-cell w-80 min-w-[20rem] pr-4' },
    },
    {
      accessorKey: 'admins',
      header: t('roles.admins'),
      cell: ({ row }) => <AdminsList admins={row.original.admins} t={t} />,
      meta: { className: 'hidden xl:table-cell' },
    },
    {
      accessorKey: 'system',
      header: t('roles.system'),
      cell: ({ row }) => <SystemStatus isSystem={row.original.system} t={t} />,
      meta: { className: 'hidden lg:table-cell' },
    },
    {
      id: 'actions',
      header: t('roles.actions'),
      cell: ({ row }) => (
        <Button
          onClick={() => openEdit(row.original)}
          disabled={row.original.system}
          size="sm"
          title={row.original.system ? t('roles.systemEditDisabled') : ''}
          className="w-full sm:w-auto"
        >
          {t('common.edit')}
        </Button>
      ),
    },
  ];

  const editRole = roles.find((r) => r.id === editRoleId);
  const dialogItems = permissions.map(
    (perm): CheckboxListItem => ({
      id: perm.name,
      name: perm.name,
      description: perm.description,
      disabled: !!editRole?.system,
    }),
  );
  const isSaveDisabled = saving || !!editRole?.system || editPermissions.length === 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <span className="text-muted-foreground">{t('common.loading')}</span>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  return (
    <AuthenticatedLayout breadcrumbs={[{ label: t('roles.title'), href: '/roles', current: true }]}>
      <Card>
        <CardHeader>
          <CardTitle>{t('roles.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={roles}
            searchKeys={['name', 'description']}
            searchPlaceholder={t('roles.searchMultiple')}
          />

          <CheckboxListDialog
            open={!!editRoleId}
            onOpenChange={(open) => !open && closeEdit()}
            title={`${t('roles.editPermissions')} ${editRole?.name || ''}`}
            warningMessage={editRole?.system ? t('roles.systemRoleWarning') : undefined}
            items={dialogItems}
            selectedItems={editPermissions}
            onItemChange={handlePermissionChange}
            onSave={() => editRoleId && handleSaveClick(editRoleId)}
            onCancel={closeEdit}
            saveDisabled={isSaveDisabled}
            saving={saving}
            saveButtonText={t('common.save')}
            cancelButtonText={t('common.cancel')}
          />

          <ConfirmationDialog
            open={showConfirm}
            onOpenChange={(open) => !open && cancelSave()}
            title={t('roles.confirmSystemSave')}
            description={t('roles.confirmSystemSaveDescription')}
            onConfirm={confirmSave}
            onCancel={cancelSave}
            confirmButtonText={t('common.confirm')}
            cancelButtonText={t('common.cancel')}
            confirmButtonVariant="destructive"
          />
        </CardContent>
      </Card>
    </AuthenticatedLayout>
  );
};

export default RolesPage;
