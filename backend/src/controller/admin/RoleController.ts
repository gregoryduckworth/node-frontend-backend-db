import { Request, Response } from 'express';
import type { ListAllRolesResponse, UpdateRolePermissionsResponse } from '@/types/roleTypes';
import { listAllRolesService, updateRolePermissionsService } from '@/service/admin/RoleService';

export const listAllRoles = async (
  _req: Request,
  res: Response<ListAllRolesResponse | { message: string }>,
) => {
  try {
    const roles = await listAllRolesService();
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
    const role = await updateRolePermissionsService(id, permissions);
    return res.status(200).json({ role });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update role permissions' });
  }
};
