import { listAllPermissions } from './PermissionController';
jest.mock('@prismaClient/client', () => ({
  prisma: {
    permission: {
      findMany: jest.fn(),
    },
  },
}));
const { prisma } = require('@prismaClient/client');

describe('PermissionController (unit)', () => {
  const mockRes = () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return all permissions with correct types', async () => {
    const permissions = [
      { id: 'perm1', name: 'perm1', description: 'desc1' },
      { id: 'perm2', name: 'perm2', description: undefined },
    ];
    prisma.permission.findMany.mockResolvedValue(permissions);
    const req: any = {};
    const res = mockRes();
    await listAllPermissions(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ permissions });
  });

  it('should handle errors', async () => {
    prisma.permission.findMany.mockRejectedValue(new Error('fail'));
    const req: any = {};
    const res = mockRes();
    await listAllPermissions(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Failed to fetch permissions' });
  });
});
