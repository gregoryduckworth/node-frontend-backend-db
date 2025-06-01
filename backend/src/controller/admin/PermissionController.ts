import { Request, Response } from 'express';
import type { Permission } from '@/types/roleTypes';
import { listAllPermissionsService } from '@/service/admin/PermissionService';

export const listAllPermissions = async (
  _req: Request,
  res: Response<{ permissions: Permission[] } | { message: string }>,
) => {
  try {
    const permissions = await listAllPermissionsService();
    return res.status(200).json({ permissions });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch permissions' });
  }
};

export {};
