import { Router } from 'express';
import { adminLogin, listAllUsers, createAdminUser } from '@/controller/admin/AdminUserController';
import { adminRefreshToken } from '@/controller/admin/AdminRefreshToken';

const router = Router();

router.post('/login', adminLogin);
router.get('/users', listAllUsers);
router.get('/token', adminRefreshToken);
router.post('/create', createAdminUser);

export default router;
