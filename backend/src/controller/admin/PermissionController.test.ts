jest.mock('@/service/admin/PermissionService', () => ({
  listAllPermissionsService: jest.fn(),
}));

import { listAllPermissions } from './PermissionController';
import { listAllPermissionsService } from '@/service/admin/PermissionService';

const mockListAllPermissionsService = listAllPermissionsService as jest.MockedFunction<
  typeof listAllPermissionsService
>;

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

    mockListAllPermissionsService.mockResolvedValue(permissions);

    const req: any = {};
    const res = mockRes();

    await listAllPermissions(req, res);

    expect(mockListAllPermissionsService).toHaveBeenCalledWith();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ permissions });
  });

  it('should handle errors', async () => {
    mockListAllPermissionsService.mockRejectedValue(new Error('Service error'));

    const req: any = {};
    const res = mockRes();

    await listAllPermissions(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Failed to fetch permissions' });
  });
});
