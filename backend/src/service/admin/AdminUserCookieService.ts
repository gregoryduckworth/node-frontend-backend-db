import { Response } from 'express';

export const getCookieOptions = () => ({
  httpOnly: true,
  maxAge: 24 * 60 * 60 * 1000,
  path: '/',
});

export const setAdminRefreshTokenCookie = (res: Response, token: string) => {
  res.cookie('adminRefreshToken', token, getCookieOptions());
};
