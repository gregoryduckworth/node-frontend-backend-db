import { refreshToken } from './RefreshToken';
import { UserTokenService } from '../../service/auth/UserTokenService';

jest.mock('../../service/auth/UserTokenService', () => ({
  UserTokenService: {
    refreshToken: jest.fn(),
  },
}));

const mockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.sendStatus = jest.fn().mockReturnValue(res);
  return res;
};

describe('refreshToken (controller)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (UserTokenService.refreshToken as jest.Mock).mockReset();
  });

  it('should return 204 if no refresh token cookie', async () => {
    const req: any = { cookies: {} };
    const res = mockRes();
    (UserTokenService.refreshToken as jest.Mock).mockResolvedValue({ status: 204 });
    await refreshToken(req, res);
    expect(res.sendStatus).toHaveBeenCalledWith(204);
  });

  it('should return 403 if user not found', async () => {
    const req: any = { cookies: { refreshToken: 'some-token' } };
    const res = mockRes();
    (UserTokenService.refreshToken as jest.Mock).mockResolvedValue({ status: 403 });
    await refreshToken(req, res);
    expect(res.sendStatus).toHaveBeenCalledWith(403);
  });

  it('should return accessToken if refresh token is valid', async () => {
    const req: any = { cookies: { refreshToken: 'valid-token' } };
    const res = mockRes();
    (UserTokenService.refreshToken as jest.Mock).mockResolvedValue({
      status: 200,
      accessToken: 'access-token',
    });
    await refreshToken(req, res);
    expect(res.json).toHaveBeenCalledWith({ accessToken: 'access-token' });
  });

  it('should return 500 on unexpected error', async () => {
    const req: any = { cookies: { refreshToken: 'valid-token' } };
    const res = mockRes();
    (UserTokenService.refreshToken as jest.Mock).mockRejectedValue(new Error('DB error'));
    await refreshToken(req, res);
    expect(res.sendStatus).toHaveBeenCalledWith(500);
  });
});
