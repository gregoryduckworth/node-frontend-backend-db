import { Request, Response, NextFunction } from 'express';
import {
  getAdminWithRolesAndPermissions,
  hasRequiredRoleOrPermission,
} from '@/service/admin/AdminAuthService';

/**
 * Middleware to check if the admin user has at least one of the required roles or permissions.
 * Usage: requireRoleOrPermission(['SUPERADMIN', 'MANAGE_USERS'])
 */
export function requireRoleOrPermission(required: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user || !user.id) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    try {
      const admin = await getAdminWithRolesAndPermissions(user.id);
      if (!admin) {
        return res.status(401).json({ message: 'Admin not found' });
      }
      if (!hasRequiredRoleOrPermission(admin, required)) {
        return res.status(403).json({ message: 'Insufficient role or permission' });
      }
      next();
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
}
