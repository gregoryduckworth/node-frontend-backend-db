import { Router } from 'express';
import { adminLogin, listAllUsers, createAdminUser } from '@controller/AdminUserController';
import { adminRefreshToken } from '@controller/adminRefreshToken';

const router = Router();

router.post('/login', adminLogin);
router.get('/users', listAllUsers);
router.get('/token', adminRefreshToken);
router.post('/create', createAdminUser);

export default router;
