import { Router } from 'express';
import UserRoute from './UserRoute';
import TestRoute from './TestRoute';
import AdminUserRoute from './AdminUserRoute';
import { requireAdmin } from '@/middlewares';

const router = Router();

router.use(UserRoute);
router.use(requireAdmin, AdminUserRoute);
if (process.env.NODE_ENV !== 'production') {
  router.use(TestRoute);
}

export default router;
