import jwt from 'jsonwebtoken';
import { prisma } from '@prismaClient/client';
import { getJwtSecrets } from '@/utils/jwtSecrets';

export const AdminTokenService = {
  generateAdminAccessToken(admin: any, secret: string) {
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
  },

  async refreshAdminToken(refreshToken: string) {
    if (!refreshToken) {
      return { status: 204 };
    }
    const admin = await prisma.adminUser.findFirst({
      where: { refresh_token: refreshToken },
    });
    if (!admin) {
      return { status: 403 };
    }
    const { refreshTokenSecret, accessTokenSecret } = getJwtSecrets();
    try {
      jwt.verify(refreshToken, refreshTokenSecret);
    } catch (err) {
      return { status: 403 };
    }
    const accessToken = this.generateAdminAccessToken(admin, accessTokenSecret);
    return { status: 200, accessToken };
  },
};
