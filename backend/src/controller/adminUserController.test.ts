import { adminLogin, listAllUsers, createAdminUser } from './AdminUserController';
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

jest.mock('bcrypt');

const { prisma } = require('@prismaClient/client');

const mockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.sendStatus = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  return res;
};

describe('AdminUserController', () => {
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
  });

  describe('adminLogin', () => {
    it('should return 400 if email is missing', async () => {
      const req: any = { body: { password: 'pass' } };
      const res = mockRes();
      await adminLogin(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Email is required' });
    });
    it('should return 400 if password is missing', async () => {
      const req: any = { body: { email: 'a@b.com' } };
      const res = mockRes();
      await adminLogin(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Password is required' });
    });
    it('should return 400 if admin not found', async () => {
      const req: any = { body: { email: 'a@b.com', password: 'pass' } };
      const res = mockRes();
      prisma.adminUser.findFirst.mockResolvedValue(null);
      await adminLogin(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid email or password' });
    });
    it('should return 400 if password does not match', async () => {
      const req: any = { body: { email: 'a@b.com', password: 'wrong' } };
      const res = mockRes();
      prisma.adminUser.findFirst.mockResolvedValue(admin);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await adminLogin(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid email or password' });
    });
    it('should return 200 and tokens if credentials are valid', async () => {
      const req: any = { body: { email: 'a@b.com', password: 'pass' } };
      const res = mockRes();
      prisma.adminUser.findFirst.mockResolvedValue(admin);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      prisma.adminUser.update.mockResolvedValue({});
      await adminLogin(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ accessToken: expect.any(String) }),
      );
      expect(res.cookie).toHaveBeenCalled();
    });
  });

  describe('listAllUsers', () => {
    it('should return 200 and users array', async () => {
      const req: any = {};
      const res = mockRes();
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
      await listAllUsers(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ users });
    });
    it('should return 200 and empty array if no users', async () => {
      const req: any = {};
      const res = mockRes();
      prisma.user.findMany.mockResolvedValue([]);
      await listAllUsers(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ users: [] });
    });
    it('should return 400 on error', async () => {
      const req: any = {};
      const res = mockRes();
      prisma.user.findMany.mockRejectedValue(new Error('fail'));
      await listAllUsers(req, res);
      expect(res.sendStatus).toHaveBeenCalledWith(400);
    });
  });

  describe('createAdminUser', () => {
    it('should return 400 if any field is missing', async () => {
      const req: any = { body: { firstName: '', lastName: '', email: '', password: '' } };
      const res = mockRes();
      await createAdminUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'All fields are required' });
    });
    it('should return 409 if admin already exists', async () => {
      const req: any = {
        body: { firstName: 'A', lastName: 'B', email: 'a@b.com', password: 'pass' },
      };
      const res = mockRes();
      prisma.adminUser.findFirst.mockResolvedValue(admin);
      await createAdminUser(req, res);
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Admin user with this email already exists',
      });
    });
    it('should return 201 and admin if created', async () => {
      const req: any = {
        body: { firstName: 'A', lastName: 'B', email: 'a@b.com', password: 'pass' },
      };
      const res = mockRes();
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
      await createAdminUser(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ admin: created });
    });
    it('should return 400 on error', async () => {
      const req: any = {
        body: { firstName: 'A', lastName: 'B', email: 'a@b.com', password: 'pass' },
      };
      const res = mockRes();
      prisma.adminUser.findFirst.mockRejectedValue(new Error('fail'));
      await createAdminUser(req, res);
      expect(res.sendStatus).toHaveBeenCalledWith(400);
    });
  });
});
