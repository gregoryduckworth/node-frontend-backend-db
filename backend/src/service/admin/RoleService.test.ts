jest.mock('@prismaClient/client', () => ({
  prisma: {
    role: {
      findMany: jest.fn(),
      update: jest.fn(),
    },
  },
}));

import { listAllRolesService, updateRolePermissionsService } from './RoleService';
const { prisma } = require('@prismaClient/client');

describe('RoleService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('listAllRolesService', () => {
    it('should return all roles with normalized data', async () => {
      const mockRolesFromDb = [
        {
          id: 'role1',
          name: 'Admin',
          description: 'Administrator role',
          system: true,
          permissions: [
            { id: 'perm1', name: 'manage_users', description: 'Manage users' },
            { id: 'perm2', name: 'manage_roles', description: null },
          ],
          admins: [
            {
              id: 'admin1',
              firstName: 'John',
              lastName: 'Doe',
              email: 'john@example.com',
            },
          ],
        },
        {
          id: 'role2',
          name: 'Editor',
          description: null,
          system: false,
          permissions: [{ id: 'perm3', name: 'edit_content', description: 'Edit content' }],
          admins: [],
        },
      ];

      prisma.role.findMany.mockResolvedValue(mockRolesFromDb);

      const result = await listAllRolesService();

      expect(prisma.role.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          name: true,
          description: true,
          system: true,
          permissions: true,
          admins: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: { name: 'asc' },
      });

      expect(result).toEqual([
        {
          id: 'role1',
          name: 'Admin',
          description: 'Administrator role',
          system: true,
          permissions: [
            { id: 'perm2', name: 'manage_roles', description: undefined },
            { id: 'perm1', name: 'manage_users', description: 'Manage users' },
          ],
          admins: [
            {
              id: 'admin1',
              firstName: 'John',
              lastName: 'Doe',
              email: 'john@example.com',
            },
          ],
        },
        {
          id: 'role2',
          name: 'Editor',
          description: undefined,
          system: false,
          permissions: [{ id: 'perm3', name: 'edit_content', description: 'Edit content' }],
          admins: [],
        },
      ]);
    });

    it('should handle database errors', async () => {
      prisma.role.findMany.mockRejectedValue(new Error('Database connection failed'));

      await expect(listAllRolesService()).rejects.toThrow('Database connection failed');
    });

    it('should sort permissions by name', async () => {
      const mockRolesFromDb = [
        {
          id: 'role1',
          name: 'TestRole',
          description: 'Test role',
          system: false,
          permissions: [
            { id: 'perm2', name: 'z_permission', description: 'Z permission' },
            { id: 'perm1', name: 'a_permission', description: 'A permission' },
            { id: 'perm3', name: 'm_permission', description: 'M permission' },
          ],
          admins: [],
        },
      ];

      prisma.role.findMany.mockResolvedValue(mockRolesFromDb);

      const result = await listAllRolesService();

      expect(result[0].permissions).toEqual([
        { id: 'perm1', name: 'a_permission', description: 'A permission' },
        { id: 'perm3', name: 'm_permission', description: 'M permission' },
        { id: 'perm2', name: 'z_permission', description: 'Z permission' },
      ]);
    });
  });

  describe('updateRolePermissionsService', () => {
    it('should update role permissions successfully', async () => {
      const roleId = 'role1';
      const permissions = ['perm1', 'perm2'];

      const mockUpdatedRole = {
        id: 'role1',
        name: 'Admin',
        description: 'Administrator role',
        system: true,
        permissions: [
          { id: 'perm1', name: 'perm1', description: 'Permission 1' },
          { id: 'perm2', name: 'perm2', description: null },
        ],
        admins: [],
      };

      prisma.role.update.mockResolvedValue(mockUpdatedRole);

      const result = await updateRolePermissionsService(roleId, permissions);

      expect(prisma.role.update).toHaveBeenCalledWith({
        where: { id: roleId },
        data: {
          permissions: {
            set: [],
            connect: permissions.map((name: string) => ({ name })),
          },
        },
        select: {
          id: true,
          name: true,
          description: true,
          system: true,
          permissions: true,
          admins: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      expect(result).toEqual({
        id: 'role1',
        name: 'Admin',
        description: 'Administrator role',
        system: true,
        permissions: [
          { id: 'perm1', name: 'perm1', description: 'Permission 1' },
          { id: 'perm2', name: 'perm2', description: undefined },
        ],
        admins: [],
      });
    });

    it('should handle update errors', async () => {
      const roleId = 'role1';
      const permissions = ['perm1'];

      prisma.role.update.mockRejectedValue(new Error('Role not found'));

      await expect(updateRolePermissionsService(roleId, permissions)).rejects.toThrow(
        'Role not found',
      );
    });

    it('should normalize description from null to undefined', async () => {
      const roleId = 'role1';
      const permissions = ['perm1'];

      const mockUpdatedRole = {
        id: 'role1',
        name: 'TestRole',
        description: null,
        system: false,
        permissions: [{ id: 'perm1', name: 'perm1', description: null }],
        admins: [],
      };

      prisma.role.update.mockResolvedValue(mockUpdatedRole);

      const result = await updateRolePermissionsService(roleId, permissions);

      expect(result.description).toBeUndefined();
      expect(result.permissions[0].description).toBeUndefined();
    });
  });
});
