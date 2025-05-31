import { adminRefreshToken } from './AdminRefreshToken';
import { AdminTokenService } from '../../service/admin/AdminTokenService';

jest.mock('../../service/admin/AdminTokenService', () => ({
  AdminTokenService: {
    refreshAdminToken: jest.fn(),
  },
}));

const mockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.sendStatus = jest.fn().mockReturnValue(res);
  return res;
};

describe('adminRefreshToken (controller)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AdminTokenService.refreshAdminToken as jest.Mock).mockReset();
  });

  it('should return 204 if no refresh token cookie', async () => {
    const req: any = { cookies: {} };
    const res = mockRes();
    (AdminTokenService.refreshAdminToken as jest.Mock).mockResolvedValue({ status: 204 });
    await adminRefreshToken(req, res);
    expect(res.sendStatus).toHaveBeenCalledWith(204);
  });

  it('should return 403 if admin not found', async () => {
    const req: any = { cookies: { adminRefreshToken: 'some-token' } };
    const res = mockRes();
    (AdminTokenService.refreshAdminToken as jest.Mock).mockResolvedValue({ status: 403 });
    await adminRefreshToken(req, res);
    expect(res.sendStatus).toHaveBeenCalledWith(403);
  });

  it('should return accessToken if refresh token is valid', async () => {
    const req: any = { cookies: { adminRefreshToken: 'valid-token' } };
    const res = mockRes();
    (AdminTokenService.refreshAdminToken as jest.Mock).mockResolvedValue({
      status: 200,
      accessToken: 'access-token',
    });
    await adminRefreshToken(req, res);
    expect(res.json).toHaveBeenCalledWith({ accessToken: 'access-token' });
  });

  it('should return 500 on unexpected error', async () => {
    const req: any = { cookies: { adminRefreshToken: 'valid-token' } };
    const res = mockRes();
    (AdminTokenService.refreshAdminToken as jest.Mock).mockRejectedValue(new Error('DB error'));
    await adminRefreshToken(req, res);
    expect(res.sendStatus).toHaveBeenCalledWith(500);
  });
});
