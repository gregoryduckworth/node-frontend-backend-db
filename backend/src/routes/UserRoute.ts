import express, { Request, Response, NextFunction } from 'express';
import {
  getAllUsers,
  getUserById,
  login,
  logout,
  register,
  updateUser,
  forgotPassword,
  resetPassword,
} from '../controller/UserController';
import { verifyToken } from '../middlewares/verifyToken';
import { refreshToken } from '../controller/refreshToken';

const router = express.Router();

const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.get('/users', asyncHandler(getAllUsers));
router.get('/users/:userId', asyncHandler(getUserById));
router.put('/users/:userId', verifyToken, asyncHandler(updateUser));

router.post('/auth/register', asyncHandler(register));
router.post('/auth/login', asyncHandler(login));
router.post('/auth/forgot-password', asyncHandler(forgotPassword));
router.post('/auth/reset-password', asyncHandler(resetPassword));
router.delete('/auth/logout', asyncHandler(logout));
router.get('/token', asyncHandler(refreshToken));

export default router;
