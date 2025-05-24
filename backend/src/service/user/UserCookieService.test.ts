import {
  getCookieOptions,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
} from './UserCookieService';
import { Response } from 'express';

describe('UserCookieService', () => {
  describe('getCookieOptions', () => {
    it('should return correct cookie options', () => {
      expect(getCookieOptions()).toEqual({
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        path: '/',
      });
    });
  });

  describe('setRefreshTokenCookie', () => {
    it('should set the refreshToken cookie with correct options', () => {
      const res = { cookie: jest.fn() } as unknown as Response;
      setRefreshTokenCookie(res, 'token123');
      expect(res.cookie).toHaveBeenCalledWith('refreshToken', 'token123', getCookieOptions());
    });
  });

  describe('clearRefreshTokenCookie', () => {
    it('should clear the refreshToken cookie with correct options', () => {
      const res = { clearCookie: jest.fn() } as unknown as Response;
      clearRefreshTokenCookie(res);
      expect(res.clearCookie).toHaveBeenCalledWith('refreshToken', getCookieOptions());
    });
  });
});
