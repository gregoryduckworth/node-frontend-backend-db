import { Response } from 'express';

export const getCookieOptions = (rememberMe?: boolean) => ({
  httpOnly: true,
  maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000, // 30 days if rememberMe, else 1 day
  path: '/',
});

export const setAdminRefreshTokenCookie = (res: Response, token: string, rememberMe?: boolean) => {
  res.cookie('adminRefreshToken', token, getCookieOptions(rememberMe));
};
