jest.mock('@prismaClient/client', () => ({
  prisma: {
    permission: {
      findMany: jest.fn(),
    },
  },
}));

import { listAllPermissionsService } from './PermissionService';
const { prisma } = require('@prismaClient/client');

describe('PermissionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('listAllPermissionsService', () => {
    it('should return all permissions with normalized data', async () => {
      const mockPermissionsFromDb = [
        {
          id: 'perm1',
          name: 'manage_users',
          description: 'Manage system users',
        },
        {
          id: 'perm2',
          name: 'edit_content',
          description: null,
        },
        {
          id: 'perm3',
          name: 'view_reports',
          description: 'View analytics reports',
        },
      ];

      prisma.permission.findMany.mockResolvedValue(mockPermissionsFromDb);

      const result = await listAllPermissionsService();

      expect(prisma.permission.findMany).toHaveBeenCalledWith({
        select: { id: true, name: true, description: true },
        orderBy: { name: 'asc' },
      });

      expect(result).toEqual([
        {
          id: 'perm1',
          name: 'manage_users',
          description: 'Manage system users',
        },
        {
          id: 'perm2',
          name: 'edit_content',
          description: undefined,
        },
        {
          id: 'perm3',
          name: 'view_reports',
          description: 'View analytics reports',
        },
      ]);
    });

    it('should handle database errors', async () => {
      prisma.permission.findMany.mockRejectedValue(new Error('Database connection failed'));

      await expect(listAllPermissionsService()).rejects.toThrow('Database connection failed');
    });

    it('should return empty array when no permissions exist', async () => {
      prisma.permission.findMany.mockResolvedValue([]);

      const result = await listAllPermissionsService();

      expect(result).toEqual([]);
    });

    it('should normalize all null descriptions to undefined', async () => {
      const mockPermissionsFromDb = [
        {
          id: 'perm1',
          name: 'permission1',
          description: null,
        },
        {
          id: 'perm2',
          name: 'permission2',
          description: null,
        },
      ];

      prisma.permission.findMany.mockResolvedValue(mockPermissionsFromDb);

      const result = await listAllPermissionsService();

      expect(result).toEqual([
        {
          id: 'perm1',
          name: 'permission1',
          description: undefined,
        },
        {
          id: 'perm2',
          name: 'permission2',
          description: undefined,
        },
      ]);
    });

    it('should maintain order by name as specified in query', async () => {
      const mockPermissionsFromDb = [
        {
          id: 'perm1',
          name: 'a_permission',
          description: 'First permission',
        },
        {
          id: 'perm2',
          name: 'b_permission',
          description: 'Second permission',
        },
        {
          id: 'perm3',
          name: 'c_permission',
          description: 'Third permission',
        },
      ];

      prisma.permission.findMany.mockResolvedValue(mockPermissionsFromDb);

      const result = await listAllPermissionsService();

      expect(result.map((p) => p.name)).toEqual(['a_permission', 'b_permission', 'c_permission']);
    });
  });
});
