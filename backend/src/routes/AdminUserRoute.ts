import { Router } from 'express';
import { adminLogin } from '@controller/AdminUserController';

const router = Router();

router.post('/login', adminLogin);

export default router;
