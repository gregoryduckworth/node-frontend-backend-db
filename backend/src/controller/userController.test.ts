import * as UserController from './UserController';
import bcrypt from 'bcrypt';

jest.mock('@prismaClient/client', () => ({
  prisma: {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
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
  res.clearCookie = jest.fn().mockReturnValue(res);
  return res;
};

describe('UserController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllUsers', () => {
    it('should return 200 and users', async () => {
      const req: any = {};
      const res = mockRes();
      const users = [{ id: 1, firstName: 'A', lastName: 'B', email: 'a@b.com' }];
      prisma.user.findMany.mockResolvedValue(users);
      await UserController.getAllUsers(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(users);
    });
    it('should return 400 on error', async () => {
      const req: any = {};
      const res = mockRes();
      prisma.user.findMany.mockRejectedValue(new Error('fail'));
      await UserController.getAllUsers(req, res);
      expect(res.sendStatus).toHaveBeenCalledWith(400);
    });
  });

  describe('getUserById', () => {
    it('should return 200 and user if found', async () => {
      const req: any = { params: { userId: '1' } };
      const res = mockRes();
      const user = { id: 1, firstName: 'A', lastName: 'B', email: 'a@b.com' };
      prisma.user.findUnique.mockResolvedValue(user);
      await UserController.getUserById(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(user);
    });
    it('should return 404 if user not found', async () => {
      const req: any = { params: { userId: '1' } };
      const res = mockRes();
      prisma.user.findUnique.mockResolvedValue(null);
      await UserController.getUserById(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });
    it('should return 400 on error', async () => {
      const req: any = { params: { userId: '1' } };
      const res = mockRes();
      prisma.user.findUnique.mockRejectedValue(new Error('fail'));
      await UserController.getUserById(req, res);
      expect(res.sendStatus).toHaveBeenCalledWith(400);
    });
  });

  describe('register', () => {
    it('should return 400 if any field is missing', async () => {
      const req: any = {
        body: { firstName: '', lastName: '', email: '', password: '', confirmPassword: '' },
      };
      const res = mockRes();
      await UserController.register(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalled();
    });
    it('should return 400 if passwords do not match', async () => {
      const req: any = {
        body: {
          firstName: 'A',
          lastName: 'B',
          email: 'a@b.com',
          password: 'pass1',
          confirmPassword: 'pass2',
        },
      };
      const res = mockRes();
      await UserController.register(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Password doesn't match" });
    });
    it('should return 400 if password is invalid', async () => {
      const req: any = {
        body: {
          firstName: 'A',
          lastName: 'B',
          email: 'a@b.com',
          password: 'short',
          confirmPassword: 'short',
        },
      };
      const res = mockRes();
      await UserController.register(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalled();
    });
    it('should return 400 if email already exists', async () => {
      const req: any = {
        body: {
          firstName: 'A',
          lastName: 'B',
          email: 'a@b.com',
          password: 'Password1',
          confirmPassword: 'Password1',
        },
      };
      const res = mockRes();
      prisma.user.findFirst.mockResolvedValue({});
      await UserController.register(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Email already exists' });
    });
    it('should return 201 if registration is successful', async () => {
      const req: any = {
        body: {
          firstName: 'A',
          lastName: 'B',
          email: 'a@b.com',
          password: 'Password1',
          confirmPassword: 'Password1',
        },
      };
      const res = mockRes();
      prisma.user.findFirst.mockResolvedValue(null);
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      prisma.user.create.mockResolvedValue({});
      await UserController.register(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'Register Successful' });
    });
    it('should return 400 on error', async () => {
      const req: any = {
        body: {
          firstName: 'A',
          lastName: 'B',
          email: 'a@b.com',
          password: 'Password1',
          confirmPassword: 'Password1',
        },
      };
      const res = mockRes();
      prisma.user.findFirst.mockRejectedValue(new Error('fail'));
      await UserController.register(req, res);
      expect(res.sendStatus).toHaveBeenCalledWith(400);
    });
  });

  describe('login', () => {
    it('should return 400 if email is missing', async () => {
      const req: any = { body: { password: 'pass' } };
      const res = mockRes();
      await UserController.login(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Email is required' });
    });
    it('should return 400 if password is missing', async () => {
      const req: any = { body: { email: 'a@b.com' } };
      const res = mockRes();
      await UserController.login(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Password is required' });
    });
    it('should return 400 if user not found', async () => {
      const req: any = { body: { email: 'a@b.com', password: 'pass' } };
      const res = mockRes();
      prisma.user.findFirst.mockResolvedValue(null);
      await UserController.login(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid email or password' });
    });
    it('should return 400 if password does not match', async () => {
      const req: any = { body: { email: 'a@b.com', password: 'wrong' } };
      const res = mockRes();
      prisma.user.findFirst.mockResolvedValue({
        id: 1,
        password: 'hashed',
        firstName: 'A',
        lastName: 'B',
        email: 'a@b.com',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await UserController.login(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid email or password' });
    });
    it('should return 200 and tokens if credentials are valid', async () => {
      const req: any = { body: { email: 'a@b.com', password: 'pass' } };
      const res = mockRes();
      const user = {
        id: 1,
        password: 'hashed',
        firstName: 'A',
        lastName: 'B',
        email: 'a@b.com',
        dateOfBirth: new Date(),
      };
      prisma.user.findFirst.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      prisma.user.update.mockResolvedValue({});
      await UserController.login(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ accessToken: expect.any(String) }),
      );
      expect(res.cookie).toHaveBeenCalled();
    });
    it('should return 400 on error', async () => {
      const req: any = { body: { email: 'a@b.com', password: 'pass' } };
      const res = mockRes();
      prisma.user.findFirst.mockRejectedValue(new Error('fail'));
      await UserController.login(req, res);
      expect(res.sendStatus).toHaveBeenCalledWith(400);
    });
  });

  // Additional tests for updateUser, logout, forgotPassword, resetPassword can be added similarly
});
