import { Router } from 'express';
import UserRoute from './UserRoute';
import TestRoute from './TestRoute';
import AdminUserRoute from './AdminUserRoute';
import { requireAdmin } from '@/middlewares';
import { adminLogin } from '@/controller/admin/AdminUserController';
import { adminRefreshToken } from '@/controller/admin/AdminRefreshToken';

const router = Router();

router.use(UserRoute);

// Public admin routes
router.post('/admin/login', adminLogin);
router.get('/admin/token', adminRefreshToken);

// Protected admin routes
router.use('/admin', requireAdmin, AdminUserRoute);

if (process.env.NODE_ENV !== 'production') {
  router.use(TestRoute);
}

export default router;
