import { Request, Response } from 'express';
import { AdminTokenService } from '@/service/admin/AdminTokenService';
import jwt from 'jsonwebtoken';

export const generateAdminAccessToken = (admin: any, secret: string) => {
  return jwt.sign(
    {
      id: admin.id,
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email,
      isAdmin: true,
    },
    secret,
    { expiresIn: '30m' },
  );
};

export const adminRefreshToken = async (req: Request, res: Response): Promise<Response> => {
  try {
    const refreshToken = req.cookies.adminRefreshToken;
    const result = await AdminTokenService.refreshAdminToken(refreshToken);
    if (result.status === 200) {
      return res.json({ accessToken: result.accessToken });
    }
    return res.sendStatus(result.status);
  } catch (error) {
    console.error('Error refreshing admin token:', error);
    return res.sendStatus(500);
  }
};
