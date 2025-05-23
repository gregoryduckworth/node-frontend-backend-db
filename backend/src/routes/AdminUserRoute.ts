import { Router } from 'express';
import { adminLogin, listAllUsers, createAdminUser } from '@/controller/admin/UserController';
import { adminRefreshToken } from '@/controller/admin/RefreshToken';

const router = Router();

router.post('/login', adminLogin);
router.get('/users', listAllUsers);
router.get('/token', adminRefreshToken);
router.post('/create', createAdminUser);

export default router;
