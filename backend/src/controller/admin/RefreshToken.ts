import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '@prismaClient/client';
import { getJwtSecrets } from '@/utils/jwtSecrets';

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
    if (!refreshToken) {
      return res.sendStatus(204);
    }

    const admin = await prisma.adminUser.findFirst({
      where: { refresh_token: refreshToken },
    });
    if (!admin) {
      return res.sendStatus(403);
    }

    const { refreshTokenSecret, accessTokenSecret } = getJwtSecrets();

    try {
      jwt.verify(refreshToken, refreshTokenSecret);
    } catch (err) {
      console.error('JWT verification failed:', err);
      return res.sendStatus(403);
    }

    const accessToken = generateAdminAccessToken(admin, accessTokenSecret);
    return res.json({ accessToken });
  } catch (error) {
    console.error('Error refreshing admin token:', error);
    return res.sendStatus(500);
  }
};
