import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '@prismaClient/client';
import { getJwtSecrets } from '../utils/jwtSecrets';

const { accessTokenSecret, refreshTokenSecret } = getJwtSecrets();

const getCookieOptions = () => ({
  httpOnly: true,
  maxAge: 24 * 60 * 60 * 1000,
  path: '/',
});

const setAdminRefreshTokenCookie = (res: Response, token: string) => {
  res.cookie('adminRefreshToken', token, getCookieOptions());
};

const handleError = (res: Response, error: any, status = 400) => {
  console.log(error);
  return res.sendStatus(status);
};

export const adminLogin = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { email, password } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    if (!password) return res.status(400).json({ message: 'Password is required' });
    const admin = await prisma.adminUser.findFirst({ where: { email } });
    const isMatched = admin ? await bcrypt.compare(password, admin.password) : false;
    if (!admin || !isMatched) return res.status(400).json({ message: 'Invalid email or password' });

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
    setAdminRefreshTokenCookie(res, refreshToken);
    return res.status(200).json({ accessToken });
  } catch (error) {
    return handleError(res, error);
  }
};

export const listAllUsers = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return res.status(200).json({ users });
  } catch (error) {
    return handleError(res, error);
  }
};

export const createAdminUser = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { firstName, lastName, email, password } = req.body;
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const existing = await prisma.adminUser.findFirst({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'Admin user with this email already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await prisma.adminUser.create({
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
    return res.status(201).json({ admin });
  } catch (error) {
    return handleError(res, error);
  }
};
