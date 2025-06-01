import { Request, Response } from 'express';
import { prisma } from '@prismaClient/client';

const roleSelect = {
  id: true,
  name: true,
  description: true,
  critical: true, // <-- Add this line
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

interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Permission {
  id: string;
  name: string;
  description?: string;
}

interface Role {
  id: string;
  name: string;
  description?: string;
  critical: boolean; // <-- Add this line
  permissions: Permission[];
  admins: AdminUser[];
}

interface ListAllRolesResponse {
  roles: Role[];
}

interface UpdateRolePermissionsResponse {
  role: Role;
}

// Service function for updating role permissions
async function updateRolePermissionsService(id: string, permissions: string[]) {
  return prisma.role.update({
    where: { id },
    data: {
      permissions: {
        set: [],
        connect: permissions.map((name: string) => ({ name })),
      },
    },
    select: roleSelect,
  });
}

export const listAllRoles = async (
  _req: Request,
  res: Response<ListAllRolesResponse | { message: string }>,
) => {
  try {
    const roles = (
      await prisma.role.findMany({
        select: roleSelect,
        orderBy: { name: 'asc' },
      })
    ).map((role) => ({
      ...role,
      description: role.description ?? undefined,
      critical: role.critical, // <-- Ensure this is included
      permissions: role.permissions
        .map((p: any) => ({
          ...p,
          description: p.description ?? undefined,
        }))
        .sort((a: any, b: any) => a.name.localeCompare(b.name)),
    }));
    return res.status(200).json({ roles });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch roles' });
  }
};

export const updateRolePermissions = async (
  req: Request,
  res: Response<UpdateRolePermissionsResponse | { message: string }>,
) => {
  const { id } = req.params;
  const { permissions } = req.body;
  if (!Array.isArray(permissions)) {
    return res.status(400).json({ message: 'Permissions must be an array of permission names' });
  }
  try {
    const updated = await updateRolePermissionsService(id, permissions);
    const role: Role = {
      ...updated,
      description: updated.description ?? undefined,
      critical: updated.critical, // <-- Ensure this is included
      permissions: updated.permissions.map((p: any) => ({
        ...p,
        description: p.description ?? undefined,
      })),
    };
    return res.status(200).json({ role });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update role permissions' });
  }
};
