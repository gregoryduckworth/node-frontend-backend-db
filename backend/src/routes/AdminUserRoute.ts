import { Router } from 'express';
import { adminLogin, listAllUsers, createAdminUser } from '@controller/AdminUserController';
import { adminRefreshToken } from '@controller/adminRefreshToken';

const router = Router();

// Silence console logs in test environments to avoid noisy test output
if (process.env.NODE_ENV === 'test') {
  // eslint-disable-next-line no-console
  console.log = () => {};
  // eslint-disable-next-line no-console
  console.error = () => {};
}

router.post('/login', adminLogin);
router.get('/users', listAllUsers);
router.get('/token', adminRefreshToken);
router.post('/create', createAdminUser);

export default router;
