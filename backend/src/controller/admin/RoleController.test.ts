// Mock Prisma client to prevent real DB connection
jest.mock('@prisma/client', () => {
  throw new Error('Prisma client should be mocked in unit tests!');
});
jest.mock('@prismaClient/client', () => ({
  prisma: {
    role: {
      findMany: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
    permission: {
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
    adminUser: {
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
    $disconnect: jest.fn(),
  },
}));

const { listAllRoles, updateRolePermissions } = require('./RoleController');
const { prisma } = require('@prismaClient/client');

const mockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('RoleController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should list all roles with permissions and admins', async () => {
    const req = {};
    const res = mockRes();
    prisma.role.findMany.mockResolvedValue([
      {
        id: 'role-test',
        name: 'role-test',
        description: 'desc',
        permissions: [{ id: 'perm-test', name: 'perm-test', description: 'desc' }],
        admins: [
          {
            id: 'admin-test',
            firstName: 'Test',
            lastName: 'Admin',
            email: 'testadmin@example.com',
          },
        ],
      },
    ]);
    await listAllRoles(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      roles: expect.arrayContaining([
        expect.objectContaining({
          id: 'role-test',
          name: 'role-test',
          description: 'desc',
          permissions: expect.arrayContaining([
            expect.objectContaining({ id: 'perm-test', name: 'perm-test', description: 'desc' }),
          ]),
          admins: expect.arrayContaining([
            expect.objectContaining({
              id: 'admin-test',
              firstName: 'Test',
              lastName: 'Admin',
              email: 'testadmin@example.com',
            }),
          ]),
        }),
      ]),
    });
  });

  it('should handle errors in listAllRoles', async () => {
    const req = {};
    const res = mockRes();
    prisma.role.findMany.mockRejectedValue(new Error('fail'));
    await listAllRoles(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Failed to fetch roles' });
  });

  it('should update role permissions', async () => {
    const req = {
      params: { id: 'role-test' },
      body: { permissions: ['perm-test'] },
    };
    const res = mockRes();
    prisma.role.update.mockResolvedValue({
      id: 'role-test',
      name: 'role-test',
      description: 'desc',
      permissions: [{ id: 'perm-test', name: 'perm-test', description: 'desc' }],
      admins: [],
    });
    await updateRolePermissions(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      role: expect.objectContaining({
        id: 'role-test',
        permissions: expect.arrayContaining([
          expect.objectContaining({ id: 'perm-test', name: 'perm-test', description: 'desc' }),
        ]),
      }),
    });
  });

  it('should handle errors in updateRolePermissions', async () => {
    const req = { params: { id: 'role-test' }, body: { permissions: ['perm-test'] } };
    const res = mockRes();
    prisma.role.update.mockRejectedValue(new Error('fail'));
    await updateRolePermissions(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Failed to update role permissions' });
  });
});
