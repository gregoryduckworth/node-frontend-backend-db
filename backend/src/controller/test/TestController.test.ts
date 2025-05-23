import { resetDatabase } from './TestController';

jest.mock('@prismaClient/client', () => ({
  prisma: {
    user: {
      deleteMany: jest.fn(),
    },
  },
}));

const { prisma } = require('@prismaClient/client');

const mockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('resetDatabase', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should delete all users and return success message', async () => {
    const req: any = {};
    const res = mockRes();
    (prisma.user.deleteMany as jest.Mock).mockResolvedValue({});
    await resetDatabase(req, res);
    expect(prisma.user.deleteMany).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Database reset successful' });
  });

  it('should return 500 and error message on failure', async () => {
    const req: any = {};
    const res = mockRes();
    (prisma.user.deleteMany as jest.Mock).mockRejectedValue(new Error('fail'));
    await resetDatabase(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Database reset failed',
      details: expect.any(Error),
    });
  });
});
