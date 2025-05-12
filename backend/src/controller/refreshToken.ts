import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '@prismaClient/client';
import { getJwtSecrets } from '../utils/jwtSecrets';

export const generateAccessToken = (user: any, secret: string) => {
  return jwt.sign(
    {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      dateOfBirth: user.dateOfBirth ? user.dateOfBirth.toISOString() : null,
    },
    secret,
    { expiresIn: '30m' },
  );
};

export const refreshToken = async (req: Request, res: Response): Promise<Response> => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.sendStatus(204);
    }

    const user = await prisma.user.findFirst({
      where: { refresh_token: refreshToken },
    });
    if (!user) {
      return res.sendStatus(403);
    }

    const { refreshTokenSecret, accessTokenSecret } = getJwtSecrets();

    try {
      jwt.verify(refreshToken, refreshTokenSecret);
    } catch (err) {
      console.error('JWT verification failed:', err);
      return res.sendStatus(403);
    }

    const accessToken = generateAccessToken(user, accessTokenSecret);
    return res.json({ accessToken });
  } catch (error) {
    console.error('Error refreshing token:', error);
    return res.sendStatus(500);
  }
};
