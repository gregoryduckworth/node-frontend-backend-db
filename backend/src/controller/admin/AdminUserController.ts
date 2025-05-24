import { Request, Response } from 'express';
import { logger } from '@/utils/logger';
import { AdminUserService } from '@/service/admin/AdminUserService';
import { setAdminRefreshTokenCookie } from '@/service/admin/AdminUserCookieService';

const handleError = (res: Response, error: any, status = 400) => {
  logger.error(error);
  const message = error?.message || 'An error occurred';
  const statusCode = error?.status || status;
  return res.status(statusCode).json({ message });
};

export const adminLogin = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { email, password } = req.body;
    const { accessToken, refreshToken } = await AdminUserService.login(email, password);
    setAdminRefreshTokenCookie(res, refreshToken);
    return res.status(200).json({ accessToken });
  } catch (error) {
    return handleError(res, error);
  }
};

export const listAllUsers = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const users = await AdminUserService.listAllUsers();
    return res.status(200).json({ users });
  } catch (error) {
    return handleError(res, error);
  }
};

export const createAdminUser = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const admin = await AdminUserService.createAdminUser(firstName, lastName, email, password);
    return res.status(201).json({ admin });
  } catch (error) {
    return handleError(res, error);
  }
};
