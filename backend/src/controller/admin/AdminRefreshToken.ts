import { Request, Response } from 'express';
import { AdminTokenService } from '@/service/admin/AdminTokenService';
import { logger } from '@/utils/logger';

export const adminRefreshToken = async (req: Request, res: Response): Promise<Response> => {
  try {
    const refreshToken = req.cookies.adminRefreshToken;
    const result = await AdminTokenService.refreshAdminToken(refreshToken);
    if (result.status === 200) {
      return res.json({ accessToken: result.accessToken });
    }
    return res.sendStatus(result.status);
  } catch (error) {
    logger.error('Error refreshing admin token:', error);
    return res.sendStatus(500);
  }
};
