import { Response } from 'express';

export const getCookieOptions = () => ({
  httpOnly: true,
  maxAge: 24 * 60 * 60 * 1000,
  path: '/',
});

export const setRefreshTokenCookie = (res: Response, token: string) => {
  res.cookie('refreshToken', token, getCookieOptions());
};

export const clearRefreshTokenCookie = (res: Response) => {
  res.clearCookie('refreshToken', getCookieOptions());
};
