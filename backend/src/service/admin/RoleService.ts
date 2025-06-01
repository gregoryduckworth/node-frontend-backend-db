import { prisma } from '@prismaClient/client';
import type { AdminUser, Permission, Role } from '@/types/roleTypes';

const roleSelect = {
  id: true,
  name: true,
  description: true,
  critical: true,
  permissions: true,
  admins: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
    },
  },
};

function normalizePermission(p: Permission): Permission {
  return {
    ...p,
    description: p.description ?? undefined,
  };
}

export async function listAllRolesService(): Promise<Role[]> {
  const roles = await prisma.role.findMany({
    select: roleSelect,
    orderBy: { name: 'asc' },
  });
  return roles.map((role) => ({
    ...role,
    description: role.description ?? undefined,
    critical: role.critical,
    permissions: (role.permissions as Permission[])
      .map(normalizePermission)
      .sort((a, b) => a.name.localeCompare(b.name)),
    admins: role.admins as AdminUser[],
  }));
}

export async function updateRolePermissionsService(
  id: string,
  permissions: string[],
): Promise<Role> {
  const updated = await prisma.role.update({
    where: { id },
    data: {
      permissions: {
        set: [],
        connect: permissions.map((name: string) => ({ name })),
      },
    },
    select: roleSelect,
  });
  return {
    ...updated,
    description: updated.description ?? undefined,
    critical: updated.critical,
    permissions: (updated.permissions as Permission[]).map(normalizePermission),
    admins: updated.admins as AdminUser[],
  };
}
