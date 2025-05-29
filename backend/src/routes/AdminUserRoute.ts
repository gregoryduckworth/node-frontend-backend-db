import { Router } from 'express';
import {
  adminLogin,
  listAllUsers,
  createAdminUser,
  listAllAdminUsers,
  updateAdminUserRoles,
} from '@/controller/admin/AdminUserController';
import { adminRefreshToken } from '@/controller/admin/AdminRefreshToken';
import { listAllRoles, updateRolePermissions } from '@/controller/admin/RoleController';
import { listAllPermissions } from '@/controller/admin/PermissionController';

const router = Router();

router.post('/login', adminLogin);
router.get('/users', listAllUsers);
router.get('/token', adminRefreshToken);
router.post('/create', createAdminUser);
router.get('/admin-users', listAllAdminUsers);
router.patch('/admin-users/:id/roles', updateAdminUserRoles);
router.get('/roles', listAllRoles);
router.patch('/roles/:id/permissions', updateRolePermissions);
router.get('/permissions', listAllPermissions);

export default router;
