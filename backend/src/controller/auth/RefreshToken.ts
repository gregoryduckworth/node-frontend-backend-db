import { Request, Response } from 'express';
import { UserTokenService } from '@/service/auth/UserTokenService';
import { logger } from '@/utils/logger';

export const refreshToken = async (req: Request, res: Response): Promise<Response> => {
  try {
    const refreshToken = req.cookies.refreshToken;
    const result = await UserTokenService.refreshToken(refreshToken);
    if (result.status === 200) {
      return res.json({ accessToken: result.accessToken });
    }
    return res.sendStatus(result.status);
  } catch (error) {
    logger.error('Error refreshing token:', error);
    return res.sendStatus(500);
  }
};
