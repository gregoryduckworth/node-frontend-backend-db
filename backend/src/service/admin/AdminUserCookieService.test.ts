import { getCookieOptions, setAdminRefreshTokenCookie } from './AdminUserCookieService';
import { Response } from 'express';

describe('AdminUserCookieService', () => {
  describe('getCookieOptions', () => {
    it('should return correct cookie options', () => {
      expect(getCookieOptions()).toEqual({
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        path: '/',
      });
    });
  });

  describe('setAdminRefreshTokenCookie', () => {
    it('should set the adminRefreshToken cookie with correct options', () => {
      const res = { cookie: jest.fn() } as unknown as Response;
      setAdminRefreshTokenCookie(res, 'token123');
      expect(res.cookie).toHaveBeenCalledWith('adminRefreshToken', 'token123', getCookieOptions());
    });
  });
});
