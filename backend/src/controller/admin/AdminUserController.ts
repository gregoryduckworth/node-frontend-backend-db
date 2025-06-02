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
    const { email, password, rememberMe } = req.body;
    const { accessToken, refreshToken } = await AdminUserService.login(email, password);
    setAdminRefreshTokenCookie(res, refreshToken, rememberMe);
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

export const listAllAdminUsers = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const admins = await AdminUserService.listAllAdminUsersWithRoles();
    return res.status(200).json({ admins });
  } catch (error) {
    return handleError(res, error);
  }
};

export const updateAdminUserRoles = async (
  req: Request,
  res: Response,
): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const { roles } = req.body;
    if (!Array.isArray(roles)) {
      return res.status(400).json({ message: 'Roles must be an array of role names' });
    }

    // Get current user ID from JWT token (set by requireAdmin middleware)
    const currentUserId = req.user?.id;
    if (!currentUserId) {
      return res.status(401).json({ message: 'Current user ID not found in token' });
    }

    const updated = await AdminUserService.updateAdminUserRoles(id, roles, currentUserId);
    return res.status(200).json({ admin: updated });
  } catch (error) {
    return handleError(res, error);
  }
};
