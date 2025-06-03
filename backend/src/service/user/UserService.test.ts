import { UserService } from './UserService';
import jwt from 'jsonwebtoken';
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

jest.mock('jsonwebtoken');
jest.mock('bcrypt', () => ({
  genSalt: jest.fn(),
  hash: jest.fn(),
  compare: jest.fn(),
}));

// Ensure jwt and bcrypt methods are always Jest mock functions
(jwt as any).sign = jest.fn();
(jwt as any).verify = jest.fn();
(bcrypt as any).genSalt = jest.fn();
(bcrypt as any).hash = jest.fn();
(bcrypt as any).compare = jest.fn();

const { prisma } = require('@prismaClient/client');

const user = {
  id: '1',
  firstName: 'A',
  lastName: 'B',
  email: 'a@b.com',
  password: 'hashed',
  dateOfBirth: new Date(),
  refresh_token: 'refresh',
};

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (bcrypt.genSalt as jest.Mock).mockReset();
    (bcrypt.hash as jest.Mock).mockReset();
    (bcrypt.compare as jest.Mock).mockReset();
    (jwt.sign as jest.Mock).mockReset();
    (jwt.verify as jest.Mock).mockReset();
  });

  describe('getAllUsers', () => {
    it('should return users', async () => {
      const users = [user];
      prisma.user.findMany.mockResolvedValue(users);
      const result = await UserService.getAllUsers();
      expect(result).toEqual(users);
    });
  });

  describe('getUserById', () => {
    it('should return user if found', async () => {
      prisma.user.findUnique.mockResolvedValue(user);
      const result = await UserService.getUserById('1');
      expect(result).toEqual(user);
    });
    it('should return null if not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      const result = await UserService.getUserById('2');
      expect(result).toBeNull();
    });
  });

  describe('validatePassword', () => {
    it('should validate a good password', () => {
      expect(UserService.validatePassword('Password1')).toEqual({ isValid: true });
    });
    it('should invalidate a short password', () => {
      expect(UserService.validatePassword('Short1')).toEqual({
        isValid: false,
        message: 'Password must be at least 8 characters long',
      });
    });
    it('should invalidate a password without capital', () => {
      expect(UserService.validatePassword('password1')).toEqual({
        isValid: false,
        message: 'Password must contain at least one capital letter',
      });
    });
    it('should invalidate a password without number', () => {
      expect(UserService.validatePassword('Password')).toEqual({
        isValid: false,
        message: 'Password must contain at least one number',
      });
    });
  });

  describe('register', () => {
    it('should throw if email exists', async () => {
      prisma.user.findFirst.mockResolvedValue(user);
      await expect(
        UserService.register({
          firstName: 'A',
          lastName: 'B',
          email: 'a@b.com',
          password: 'Password1',
          dateOfBirth: '1990-01-01',
        }),
      ).rejects.toThrow('Email already exists');
    });
    it('should register user if email does not exist', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      prisma.user.create.mockResolvedValue({});
      const result = await UserService.register({
        firstName: 'A',
        lastName: 'B',
        email: 'a@b.com',
        password: 'Password1',
        dateOfBirth: '1990-01-01',
      });
      expect(result).toEqual({ message: 'Register Successful' });
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          firstName: 'A',
          lastName: 'B',
          email: 'a@b.com',
          password: 'hashed',
          dateOfBirth: new Date('1990-01-01'),
        },
      });
    });
  });

  describe('login', () => {
    it('should throw if user not found', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      await expect(UserService.login('a@b.com', 'pass')).rejects.toThrow(
        'Invalid email or password',
      );
    });
    it('should throw if password does not match', async () => {
      prisma.user.findFirst.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(UserService.login('a@b.com', 'wrong')).rejects.toThrow(
        'Invalid email or password',
      );
    });
    it('should return tokens if credentials are valid', async () => {
      prisma.user.findFirst.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      prisma.user.update.mockResolvedValue({});
      (jwt.sign as jest.Mock)
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');
      const result = await UserService.login('a@b.com', 'Password1');
      expect(result).toEqual({ accessToken: 'access-token', refreshToken: 'refresh-token' });
    });
  });

  describe('updateUser', () => {
    it('should throw if email already exists for another user', async () => {
      prisma.user.findFirst.mockResolvedValue({ ...user, id: '2' });
      await expect(
        UserService.updateUser('1', {
          firstName: 'A',
          lastName: 'B',
          email: 'a@b.com',
          dateOfBirth: null,
        }),
      ).rejects.toThrow('Email already exists');
    });
    it('should update user if email is unique', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      prisma.user.update.mockResolvedValue({});
      const result = await UserService.updateUser('1', {
        firstName: 'A',
        lastName: 'B',
        email: 'a@b.com',
        dateOfBirth: null,
      });
      expect(result).toEqual({ message: 'User updated' });
    });
  });

  describe('logout', () => {
    it('should return 204 if no refreshToken', async () => {
      const result = await UserService.logout(undefined as any);
      expect(result).toEqual({ status: 204 });
    });
    it('should return 204 if user not found', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      const result = await UserService.logout('refresh');
      expect(result).toEqual({ status: 204 });
    });
    it('should clear refresh token and return 200', async () => {
      prisma.user.findFirst.mockResolvedValue(user);
      prisma.user.update.mockResolvedValue({});
      const result = await UserService.logout('refresh');
      expect(result).toEqual({ status: 200, message: 'OK' });
    });
  });

  describe('forgotPassword', () => {
    it('should return message if user not found', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      const result = await UserService.forgotPassword('notfound@b.com');
      expect(result).toEqual({ message: 'Password reset instructions sent to your email' });
    });
    it('should set reset token and return message if user found', async () => {
      prisma.user.findFirst.mockResolvedValue(user);
      (jwt.sign as jest.Mock).mockReturnValue('reset-token');
      prisma.user.update.mockResolvedValue({});
      const result = await UserService.forgotPassword('a@b.com');
      expect(result).toEqual({ message: 'Password reset instructions sent to your email' });
    });
  });

  describe('resetPassword', () => {
    it('should throw if token is invalid', async () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('fail');
      });
      await expect(UserService.resetPassword('badtoken', 'Password1')).rejects.toThrow(
        'Invalid or expired token',
      );
    });
    it('should throw if user not found', async () => {
      (jwt.verify as jest.Mock).mockReturnValue({ userId: '1' });
      prisma.user.findFirst.mockResolvedValue(null);
      await expect(UserService.resetPassword('token', 'Password1')).rejects.toThrow(
        'Invalid or expired token',
      );
    });
    it('should reset password if valid', async () => {
      (jwt.verify as jest.Mock).mockReturnValue({ userId: '1' });
      prisma.user.findFirst.mockResolvedValue(user);
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      prisma.user.update.mockResolvedValue({});
      const result = await UserService.resetPassword('token', 'Password1');
      expect(result).toEqual({ message: 'Password has been reset successfully' });
    });
  });
});
