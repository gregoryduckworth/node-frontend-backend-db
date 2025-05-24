import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '@prismaClient/client';
import { getJwtSecrets } from '@/utils/jwtSecrets';

const { accessTokenSecret, refreshTokenSecret } = getJwtSecrets();

export const AdminUserService = {
  async login(email: string, password: string) {
    if (!email) throw new Error('Email is required');
    if (!password) throw new Error('Password is required');
    const admin = await prisma.adminUser.findFirst({ where: { email } });
    const isMatched = admin ? await bcrypt.compare(password, admin.password) : false;
    if (!admin || !isMatched) throw new Error('Invalid email or password');

    const accessToken = jwt.sign(
      {
        id: admin.id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        isAdmin: true,
      },
      accessTokenSecret,
      { expiresIn: '30m' },
    );
    const refreshToken = jwt.sign(
      {
        id: admin.id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        isAdmin: true,
      },
      refreshTokenSecret,
      { expiresIn: '1d' },
    );
    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { refresh_token: refreshToken },
    });
    return { accessToken, refreshToken, admin };
  },

  async listAllUsers() {
    return prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  async listAllAdminUsersWithRoles() {
    return prisma.adminUser.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        createdAt: true,
        roles: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });
  },

  async createAdminUser(firstName: string, lastName: string, email: string, password: string) {
    if (!firstName || !lastName || !email || !password) {
      throw new Error('All fields are required');
    }
    const existing = await prisma.adminUser.findFirst({ where: { email } });
    if (existing) {
      const err: any = new Error('Admin user with this email already exists');
      err.status = 409;
      throw err;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    return prisma.adminUser.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        createdAt: true,
      },
    });
  },
};
