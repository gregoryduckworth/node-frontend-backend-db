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

const clearRefreshTokenCookie = (res: Response) => {
  res.clearCookie('refreshToken', getCookieOptions());
};

const setRefreshTokenCookie = (res: Response, token: string) => {
  res.cookie('refreshToken', token, getCookieOptions());
};

const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (password.length < 8) {
    return {
      isValid: false,
      message: 'Password must be at least 8 characters long',
    };
  }
  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one capital letter',
    };
  }
  if (!/\d/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one number',
    };
  }
  return { isValid: true };
};

const handleError = (res: Response, error: any, status = 400) => {
  console.log(error);
  return res.sendStatus(status);
};

export const getAllUsers = async (req: Request, res: Response): Promise<Response> => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, firstName: true, lastName: true, email: true },
    });
    return res.status(200).json(users);
  } catch (error) {
    return handleError(res, error);
  }
};

export const getUserById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { userId } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, firstName: true, lastName: true, email: true },
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.status(200).json(user);
  } catch (error) {
    return handleError(res, error);
  }
};

export const register = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { firstName, lastName, email, password, confirmPassword } = req.body;
    if (!firstName) return res.status(400).json({ message: 'First name is required' });
    if (!lastName) return res.status(400).json({ message: 'Last name is required' });
    if (!email) return res.status(400).json({ message: 'Email is required' });
    if (!password) return res.status(400).json({ message: 'Password is required' });
    if (!confirmPassword) return res.status(400).json({ message: 'Confirm Password is required' });
    if (password !== confirmPassword)
      return res.status(400).json({ message: "Password doesn't match" });

    const validation = validatePassword(password);
    if (!validation.isValid) {
      return res.status(400).json({ message: validation.message });
    }

    const isUserExist = await prisma.user.findFirst({ where: { email } });
    if (isUserExist) return res.status(400).json({ message: 'Email already exists' });
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    await prisma.user.create({
      data: { firstName, lastName, email, password: hashedPassword },
    });
    return res.status(201).json({ message: 'Register Successful' });
  } catch (error) {
    return handleError(res, error);
  }
};

export const login = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, password } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    if (!password) return res.status(400).json({ message: 'Password is required' });
    const user = await prisma.user.findFirst({ where: { email } });
    const isMatched = user ? await bcrypt.compare(password, user.password) : false;
    if (!user || !isMatched) return res.status(400).json({ message: 'Invalid email or password' });

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
    setRefreshTokenCookie(res, refreshToken);
    return res.status(200).json({ accessToken });
  } catch (error) {
    return handleError(res, error);
  }
};

export const updateUser = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { firstName, lastName, email, dateOfBirth } = req.body;
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.sendStatus(401);
    if (!firstName) return res.status(400).json({ message: 'First name is required' });
    if (!lastName) return res.status(400).json({ message: 'Last name is required' });
    if (!email) return res.status(400).json({ message: 'Email is required' });
    try {
      jwt.verify(refreshToken, refreshTokenSecret);
    } catch (err) {
      return res.sendStatus(403);
    }
    const user = await prisma.user.findUnique({
      where: { id: req.params.userId },
    });
    if (!user) return res.sendStatus(403);
    if (user.refresh_token !== refreshToken) return res.sendStatus(403);

    if (email !== user.email) {
      const existingUserWithEmail = await prisma.user.findFirst({
        where: { email },
      });
      if (existingUserWithEmail) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }

    await prisma.user.update({
      where: { id: req.params.userId },
      data: {
        firstName,
        lastName,
        email,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      },
    });
    return res.status(200).json({ message: 'User updated' });
  } catch (error) {
    return handleError(res, error);
  }
};

export const logout = async (req: Request, res: Response): Promise<Response> => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.sendStatus(204);
    const user = await prisma.user.findFirst({
      where: { refresh_token: refreshToken },
    });
    if (!user) return res.sendStatus(204);
    await prisma.user.update({
      where: { id: user.id },
      data: { refresh_token: null },
    });
    clearRefreshTokenCookie(res);
    return res.status(200).json({ message: 'OK' });
  } catch (error) {
    return handleError(res, error);
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await prisma.user.findFirst({ where: { email } });
    if (!user) {
      return res.status(200).json({ message: 'Password reset instructions sent to your email' });
    }

    const resetToken = jwt.sign({ userId: user.id, email }, accessTokenSecret, {
      expiresIn: '1h',
    });

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        reset_token: resetToken,
        reset_token_expires: expiresAt,
      },
    });

    // In a real application, you would send an email with a link containing the token
    // For example: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`
    // console.log(`forgotPassword function\n-------------------------`);
    // console.log(`Reset token for ${email}: ${resetToken}`);
    // console.log(
    //   `Reset link would be: http://localhost:5173/reset-password?token=${resetToken}`
    // );

    return res.status(200).json({ message: 'Password reset instructions sent to your email' });
  } catch (error) {
    return handleError(res, error, 500);
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { token, password, confirmPassword } = req.body;

    if (!token) return res.status(400).json({ message: 'Token is required' });
    if (!password) return res.status(400).json({ message: 'Password is required' });
    if (!confirmPassword) return res.status(400).json({ message: 'Confirm password is required' });
    if (password !== confirmPassword)
      return res.status(400).json({ message: "Passwords don't match" });

    const validation = validatePassword(password);
    if (!validation.isValid) {
      return res.status(400).json({ message: validation.message });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, accessTokenSecret);
    } catch (error) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const user = await prisma.user.findFirst({
      where: {
        id: (decoded as any).userId,
        reset_token: token,
        reset_token_expires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        reset_token: null,
        reset_token_expires: null,
      },
    });

    return res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    return handleError(res, error, 500);
  }
};
