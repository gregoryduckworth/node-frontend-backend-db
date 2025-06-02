import jwt from 'jsonwebtoken';
import { prisma } from '@prismaClient/client';
import { getJwtSecrets } from '@/utils/jwtSecrets';

export const AdminTokenService = {
  generateAdminAccessToken(admin: any, secret: string) {
    const roles = admin.roles ? admin.roles.map((role: any) => role.name) : [];
    // Fetch permissions from roles (if present)
    let permissions: string[] = [];
    if (admin.roles && admin.roles.length > 0 && admin.roles[0].permissions) {
      const permissionsSet = new Set<string>();
      admin.roles.forEach((role: any) => {
        (role.permissions || []).forEach((perm: any) => permissionsSet.add(perm.name));
      });
      permissions = Array.from(permissionsSet);
    }
    return jwt.sign(
      {
        id: admin.id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        isAdmin: true,
        roles,
        permissions,
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
      include: {
        roles: {
          select: {
            name: true,
            permissions: {
              select: { name: true },
            },
          },
        },
      },
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
