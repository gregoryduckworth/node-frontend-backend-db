import { Router } from 'express';
import {
  adminLogin,
  listAllUsers,
  createAdminUser,
  listAllAdminUsers,
} from '@/controller/admin/AdminUserController';
import { adminRefreshToken } from '@/controller/admin/AdminRefreshToken';

const router = Router();

router.post('/login', adminLogin);
router.get('/users', listAllUsers);
router.get('/token', adminRefreshToken);
router.post('/create', createAdminUser);
router.get('/admin-users', listAllAdminUsers);

export default router;
