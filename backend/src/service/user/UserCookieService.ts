import { Response } from 'express';

export const getCookieOptions = (rememberMe?: boolean) => ({
  httpOnly: true,
  maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : undefined, // 30 days if rememberMe, else session cookie
  path: '/',
});

export const setRefreshTokenCookie = (res: Response, token: string, rememberMe?: boolean) => {
  res.cookie('refreshToken', token, getCookieOptions(rememberMe));
};

export const clearRefreshTokenCookie = (res: Response) => {
  res.clearCookie('refreshToken', getCookieOptions());
};
