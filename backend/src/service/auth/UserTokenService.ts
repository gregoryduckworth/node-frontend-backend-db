import jwt from 'jsonwebtoken';
import { prisma } from '@prismaClient/client';
import { getJwtSecrets } from '@/utils/jwtSecrets';

export const UserTokenService = {
  generateAccessToken(user: any, secret: string) {
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
  },

  async refreshToken(refreshToken: string) {
    if (!refreshToken) {
      return { status: 204 };
    }
    const user = await prisma.user.findFirst({
      where: { refresh_token: refreshToken },
    });
    if (!user) {
      return { status: 403 };
    }
    const { refreshTokenSecret, accessTokenSecret } = getJwtSecrets();
    try {
      jwt.verify(refreshToken, refreshTokenSecret);
    } catch (err) {
      return { status: 403 };
    }
    const accessToken = this.generateAccessToken(user, accessTokenSecret);
    return { status: 200, accessToken };
  },
};
