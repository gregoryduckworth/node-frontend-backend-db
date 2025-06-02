jest.mock('@/service/admin/RoleService', () => ({
  listAllRolesService: jest.fn(),
  updateRolePermissionsService: jest.fn(),
}));

import { listAllRoles, updateRolePermissions } from './RoleController';
import { listAllRolesService, updateRolePermissionsService } from '@/service/admin/RoleService';

const mockListAllRolesService = listAllRolesService as jest.MockedFunction<
  typeof listAllRolesService
>;
const mockUpdateRolePermissionsService = updateRolePermissionsService as jest.MockedFunction<
  typeof updateRolePermissionsService
>;

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
    const req: any = {};
    const res = mockRes();

    const mockRoles = [
      {
        id: 'role-test',
        name: 'role-test',
        description: 'desc',
        system: true,
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
    ];

    mockListAllRolesService.mockResolvedValue(mockRoles);

    await listAllRoles(req, res);

    expect(mockListAllRolesService).toHaveBeenCalledWith();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ roles: mockRoles });
  });

  it('should handle errors in listAllRoles', async () => {
    const req: any = {};
    const res = mockRes();

    mockListAllRolesService.mockRejectedValue(new Error('Service error'));

    await listAllRoles(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Failed to fetch roles' });
  });

  it('should update role permissions', async () => {
    const req: any = {
      params: { id: 'role-test' },
      body: { permissions: ['perm-test'] },
    };
    const res = mockRes();

    const mockUpdatedRole = {
      id: 'role-test',
      name: 'role-test',
      description: 'desc',
      system: false,
      permissions: [{ id: 'perm-test', name: 'perm-test', description: 'desc' }],
      admins: [],
    };

    mockUpdateRolePermissionsService.mockResolvedValue(mockUpdatedRole);

    await updateRolePermissions(req, res);

    expect(mockUpdateRolePermissionsService).toHaveBeenCalledWith('role-test', ['perm-test']);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ role: mockUpdatedRole });
  });

  it('should handle errors in updateRolePermissions', async () => {
    const req: any = { params: { id: 'role-test' }, body: { permissions: ['perm-test'] } };
    const res = mockRes();

    mockUpdateRolePermissionsService.mockRejectedValue(new Error('Service error'));

    await updateRolePermissions(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Failed to update role permissions' });
  });
});
