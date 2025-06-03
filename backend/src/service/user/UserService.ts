import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '@prismaClient/client';
import { getJwtSecrets } from '@/utils/jwtSecrets';

const { accessTokenSecret, refreshTokenSecret } = getJwtSecrets();

export const UserService = {
  async getAllUsers() {
    return prisma.user.findMany({
      select: { id: true, firstName: true, lastName: true, email: true },
    });
  },

  async getUserById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, firstName: true, lastName: true, email: true },
    });
  },

  validatePassword(password: string): { isValid: boolean; message?: string } {
    if (password.length < 8) {
      return { isValid: false, message: 'Password must be at least 8 characters long' };
    }
    if (!/[A-Z]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one capital letter' };
    }
    if (!/\d/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one number' };
    }
    return { isValid: true };
  },

  async register({
    firstName,
    lastName,
    email,
    password,
    dateOfBirth,
  }: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    dateOfBirth: string;
  }) {
    const isUserExist = await prisma.user.findFirst({ where: { email } });
    if (isUserExist) throw new Error('Email already exists');
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        dateOfBirth: new Date(dateOfBirth),
      },
    });
    return { message: 'Register Successful' };
  },

  async login(email: string, password: string) {
    const user = await prisma.user.findFirst({ where: { email } });
    const isMatched = user ? await bcrypt.compare(password, user.password) : false;
    if (!user || !isMatched) throw new Error('Invalid email or password');
    const dateOfBirthFormatted = user.dateOfBirth ? user.dateOfBirth.toISOString() : null;
    const accessToken = jwt.sign(
      {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        dateOfBirth: dateOfBirthFormatted,
      },
      accessTokenSecret,
      { expiresIn: '30m' },
    );
    const refreshToken = jwt.sign(
      {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        dateOfBirth: dateOfBirthFormatted,
      },
      refreshTokenSecret,
      { expiresIn: '1d' },
    );
    await prisma.user.update({
      where: { id: user.id },
      data: { refresh_token: refreshToken },
    });
    return { accessToken, refreshToken };
  },

  async updateUser(
    userId: string,
    {
      firstName,
      lastName,
      email,
      dateOfBirth,
    }: { firstName: string; lastName: string; email: string; dateOfBirth?: string | null },
  ) {
    if (email) {
      const existingUserWithEmail = await prisma.user.findFirst({ where: { email } });
      if (existingUserWithEmail && existingUserWithEmail.id !== userId) {
        throw Object.assign(new Error('Email already exists'), { status: 400 });
      }
    }
    await prisma.user.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
        email,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      },
    });
    return { message: 'User updated' };
  },

  async logout(refreshToken: string) {
    if (!refreshToken) return { status: 204 };
    const user = await prisma.user.findFirst({ where: { refresh_token: refreshToken } });
    if (!user) return { status: 204 };
    await prisma.user.update({ where: { id: user.id }, data: { refresh_token: null } });
    return { status: 200, message: 'OK' };
  },

  async forgotPassword(email: string) {
    const user = await prisma.user.findFirst({ where: { email } });
    if (!user) return { message: 'Password reset instructions sent to your email' };
    const resetToken = jwt.sign({ userId: user.id, email }, accessTokenSecret, { expiresIn: '1h' });
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);
    await prisma.user.update({
      where: { id: user.id },
      data: { reset_token: resetToken, reset_token_expires: expiresAt },
    });
    return { message: 'Password reset instructions sent to your email' };
  },

  async resetPassword(token: string, password: string) {
    let decoded;
    try {
      decoded = jwt.verify(token, accessTokenSecret);
    } catch (error) {
      throw Object.assign(new Error('Invalid or expired token'), { status: 400 });
    }
    const user = await prisma.user.findFirst({
      where: {
        id: (decoded as any).userId,
        reset_token: token,
        reset_token_expires: { gt: new Date() },
      },
    });
    if (!user) throw Object.assign(new Error('Invalid or expired token'), { status: 400 });
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, reset_token: null, reset_token_expires: null },
    });
    return { message: 'Password has been reset successfully' };
  },
};
