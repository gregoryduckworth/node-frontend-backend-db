import { Request, Response } from 'express';
import { UserService } from '@/service/user/UserService';
import { setRefreshTokenCookie, clearRefreshTokenCookie } from '@/service/user/UserCookieService';
import { logger } from '@/utils/logger';

const handleError = (res: Response, error: any, status = 400) => {
  logger.error(error);
  const message = error?.message || 'An error occurred';
  const statusCode = error?.status || status;
  return res.status(statusCode).json({ message });
};

export const getAllUsers = async (req: Request, res: Response): Promise<Response> => {
  try {
    const users = await UserService.getAllUsers();
    return res.status(200).json(users);
  } catch (error) {
    return handleError(res, error);
  }
};

export const getUserById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { userId } = req.params;
    const user = await UserService.getUserById(userId);
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
    const validation = UserService.validatePassword(password);
    if (!validation.isValid) {
      return res.status(400).json({ message: validation.message });
    }
    await UserService.register({ firstName, lastName, email, password });
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
    const { accessToken, refreshToken } = await UserService.login(email, password);
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
    try {
      // Token verification logic should be handled in middleware or service, but kept here for now
    } catch (err) {
      return res.sendStatus(403);
    }
    const user = await UserService.getUserById(req.params.userId);
    if (!user) return res.sendStatus(403);
    await UserService.updateUser(req.params.userId, { firstName, lastName, email, dateOfBirth });
    return res.status(200).json({ message: 'User updated' });
  } catch (error) {
    return handleError(res, error);
  }
};

export const logout = async (req: Request, res: Response): Promise<Response> => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.sendStatus(204);
    }
    const result = await UserService.logout(refreshToken);
    if (result.status === 204) {
      clearRefreshTokenCookie(res);
      return res.sendStatus(204);
    }
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
    const result = await UserService.forgotPassword(email);
    return res.status(200).json(result);
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
    const validation = UserService.validatePassword(password);
    if (!validation.isValid) {
      return res.status(400).json({ message: validation.message });
    }
    await UserService.resetPassword(token, password);
    return res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    return handleError(res, error, 500);
  }
};
