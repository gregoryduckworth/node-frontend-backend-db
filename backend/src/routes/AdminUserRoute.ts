import { Router } from 'express';
import { adminLogin, listAllUsers } from '@controller/AdminUserController';
import { adminRefreshToken } from '@controller/adminRefreshToken';

const router = Router();

router.post('/login', adminLogin);
router.get('/users', listAllUsers);
router.get('/token', adminRefreshToken);

export default router;
