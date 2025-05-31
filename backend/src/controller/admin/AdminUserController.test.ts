import { adminLogin, listAllUsers, createAdminUser } from './AdminUserController';
import { AdminUserService } from '@/service/admin/AdminUserService';

jest.mock('@prisma/client', () => {
  throw new Error('Prisma client should be mocked in unit tests!');
});
jest.mock('@prismaClient/client');

jest.mock('@/service/admin/AdminUserService', () => ({
  AdminUserService: {
    login: jest.fn(),
    listAllUsers: jest.fn(),
    createAdminUser: jest.fn(),
  },
}));

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

jest.resetModules();

const mockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.sendStatus = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn().mockReturnValue(res);
  return res;
};

describe('AdminUserController', () => {
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
    it('should return 400 if admin not found', async () => {
      const req: any = { body: { email: 'a@b.com', password: 'pass' } };
      const res = mockRes();
      (AdminUserService.login as jest.Mock).mockRejectedValue(
        new Error('Invalid email or password'),
      );
      await adminLogin(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid email or password' });
    });

    it('should return 400 if password does not match', async () => {
      const req: any = { body: { email: 'a@b.com', password: 'wrong' } };
      const res = mockRes();
      (AdminUserService.login as jest.Mock).mockRejectedValue(
        new Error('Invalid email or password'),
      );
      await adminLogin(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid email or password' });
    });

    it('should return 200 and tokens if credentials are valid', async () => {
      const req: any = { body: { email: 'a@b.com', password: 'pass' } };
      const res = mockRes();
      (AdminUserService.login as jest.Mock).mockResolvedValue({
        accessToken: 'token',
        refreshToken: 'refresh',
      });
      await adminLogin(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ accessToken: expect.any(String) }),
      );
      expect(res.cookie).toHaveBeenCalled();
    });

    it('should return 400 on error', async () => {
      const req: any = { body: { email: 'a@b.com', password: 'pass' } };
      const res = mockRes();
      (AdminUserService.login as jest.Mock).mockRejectedValue(
        new Error('Invalid email or password'),
      );
      await adminLogin(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid email or password' });
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
      (AdminUserService.listAllUsers as jest.Mock).mockResolvedValue(users);
      await listAllUsers(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ users });
    });

    it('should return 200 and empty array if no users', async () => {
      const req: any = {};
      const res = mockRes();
      (AdminUserService.listAllUsers as jest.Mock).mockResolvedValue([]);
      await listAllUsers(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ users: [] });
    });

    it('should return 400 on error', async () => {
      const req: any = {};
      const res = mockRes();
      (AdminUserService.listAllUsers as jest.Mock).mockRejectedValue(new Error('fail'));
      await listAllUsers(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'fail' });
    });
  });

  describe('createAdminUser', () => {
    it('should return 409 if admin already exists', async () => {
      const req: any = {
        body: { firstName: 'A', lastName: 'B', email: 'a@b.com', password: 'pass' },
      };
      const res = mockRes();
      // Simulate service throwing with status 409
      const error: any = new Error('Admin user with this email already exists');
      error.status = 409;
      (AdminUserService.createAdminUser as jest.Mock).mockRejectedValue(error);
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
      const created = {
        id: 1,
        firstName: 'A',
        lastName: 'B',
        email: 'a@b.com',
        createdAt: new Date(),
      };
      (AdminUserService.createAdminUser as jest.Mock).mockResolvedValue(created);
      await createAdminUser(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ admin: created });
    });

    it('should return 400 on error', async () => {
      const req: any = {
        body: { firstName: 'A', lastName: 'B', email: 'a@b.com', password: 'pass' },
      };
      const res = mockRes();
      (AdminUserService.createAdminUser as jest.Mock).mockRejectedValue(new Error('fail'));
      await createAdminUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'fail' });
    });
  });
});
