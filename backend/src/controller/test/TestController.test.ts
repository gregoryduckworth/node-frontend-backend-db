import { resetDatabase } from './TestController';

jest.mock('@prismaClient/client', () => ({
  prisma: {
    user: {
      deleteMany: jest.fn(),
    },
  },
}));

jest.mock('child_process', () => ({
  exec: jest.fn((_cmd, _opts, cb) => {
    if (typeof cb === 'function') cb(null, 'seed output', '');
  }),
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
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    await resetDatabase(req, res);
    expect(prisma.user.deleteMany).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('Database reset'),
      }),
    );
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
