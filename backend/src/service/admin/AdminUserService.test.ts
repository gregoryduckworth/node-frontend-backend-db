import { AdminUserService } from './AdminUserService';
import { getJwtSecrets } from '@/utils/jwtSecrets';
import bcrypt from 'bcrypt';

jest.mock('@prismaClient/client', () => ({
  prisma: {
    adminUser: {
      findFirst: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
    user: {
      findMany: jest.fn(),
    },
  },
}));

jest.mock('bcrypt', () => ({
  genSalt: jest.fn(),
  hash: jest.fn(),
  compare: jest.fn(),
}));

const { prisma } = require('@prismaClient/client');

describe('AdminUserService', () => {
  const { accessTokenSecret, refreshTokenSecret } = getJwtSecrets();
  const admin = {
    id: 1,
    firstName: 'A',
    lastName: 'B',
    email: 'a@b.com',
    password: 'hashed',
    refresh_token: 'refresh',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Ensure all bcrypt methods are reset as Jest mocks
    (bcrypt.genSalt as jest.Mock).mockReset();
    (bcrypt.hash as jest.Mock).mockReset();
    (bcrypt.compare as jest.Mock).mockReset();
  });

  describe('login', () => {
    it('should throw if email is missing', async () => {
      await expect(AdminUserService.login('', 'pass')).rejects.toThrow('Email is required');
    });

    it('should throw if password is missing', async () => {
      await expect(AdminUserService.login('a@b.com', '')).rejects.toThrow('Password is required');
    });

    it('should throw if admin not found', async () => {
      prisma.adminUser.findFirst.mockResolvedValue(null);
      await expect(AdminUserService.login('a@b.com', 'pass')).rejects.toThrow(
        'Invalid email or password',
      );
    });

    it('should throw if password does not match', async () => {
      prisma.adminUser.findFirst.mockResolvedValue(admin);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(AdminUserService.login('a@b.com', 'wrong')).rejects.toThrow(
        'Invalid email or password',
      );
    });

    it('should return tokens if credentials are valid', async () => {
      prisma.adminUser.findFirst.mockResolvedValue(admin);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      prisma.adminUser.update.mockResolvedValue({});
      const result = await AdminUserService.login('a@b.com', 'pass');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('admin');
    });
  });

  describe('listAllUsers', () => {
    it('should return users array', async () => {
      const users = [
        {
          id: 1,
          firstName: 'U',
          lastName: 'S',
          email: 'u@s.com',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      prisma.user.findMany.mockResolvedValue(users);
      const result = await AdminUserService.listAllUsers();
      expect(result).toEqual(users);
    });

    it('should return empty array if no users', async () => {
      prisma.user.findMany.mockResolvedValue([]);
      const result = await AdminUserService.listAllUsers();
      expect(result).toEqual([]);
    });

    it('should throw on error', async () => {
      prisma.user.findMany.mockRejectedValue(new Error('fail'));
      await expect(AdminUserService.listAllUsers()).rejects.toThrow('fail');
    });
  });

  describe('createAdminUser', () => {
    it('should throw if any field is missing', async () => {
      await expect(AdminUserService.createAdminUser('', '', '', '')).rejects.toThrow(
        'All fields are required',
      );
    });

    it('should throw 409 if admin already exists', async () => {
      prisma.adminUser.findFirst.mockResolvedValue(admin);
      await expect(AdminUserService.createAdminUser('A', 'B', 'a@b.com', 'pass')).rejects.toThrow(
        'Admin user with this email already exists',
      );
    });

    it('should return admin if created', async () => {
      prisma.adminUser.findFirst.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      const created = {
        id: 1,
        firstName: 'A',
        lastName: 'B',
        email: 'a@b.com',
        createdAt: new Date(),
      };
      prisma.adminUser.create.mockResolvedValue(created);
      const result = await AdminUserService.createAdminUser('A', 'B', 'a@b.com', 'pass');
      expect(result).toEqual(created);
    });

    it('should throw on error', async () => {
      prisma.adminUser.findFirst.mockRejectedValue(new Error('fail'));
      await expect(AdminUserService.createAdminUser('A', 'B', 'a@b.com', 'pass')).rejects.toThrow(
        'fail',
      );
    });
  });
});
