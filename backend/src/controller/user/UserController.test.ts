import * as UserController from './UserController';
import { UserService } from '../../service/user/UserService';

jest.mock('../../service/user/UserService', () => ({
  UserService: {
    getAllUsers: jest.fn(),
    getUserById: jest.fn(),
    register: jest.fn(),
    login: jest.fn(),
    validatePassword: jest.fn(),
    updateUser: jest.fn(),
    logout: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
  },
}));

const mockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.sendStatus = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn().mockReturnValue(res);
  return res;
};

describe('UserController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (UserService.getAllUsers as jest.Mock).mockReset();
    (UserService.getUserById as jest.Mock).mockReset();
    (UserService.register as jest.Mock).mockReset();
    (UserService.login as jest.Mock).mockReset();
    (UserService.validatePassword as jest.Mock).mockReset();
    (UserService.updateUser as jest.Mock).mockReset();
    (UserService.logout as jest.Mock).mockReset();
    (UserService.forgotPassword as jest.Mock).mockReset();
    (UserService.resetPassword as jest.Mock).mockReset();
  });

  it('getAllUsers: returns 200 and users', async () => {
    const req: any = {};
    const res = mockRes();
    (UserService.getAllUsers as jest.Mock).mockResolvedValue([{ id: 1 }]);
    await UserController.getAllUsers(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([{ id: 1 }]);
  });

  it('getAllUsers: returns 400 on error', async () => {
    const req: any = {};
    const res = mockRes();
    (UserService.getAllUsers as jest.Mock).mockRejectedValue(new Error('fail'));
    await UserController.getAllUsers(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'fail' });
  });

  it('getUserById: returns 200 and user if found', async () => {
    const req: any = { params: { userId: '1' } };
    const res = mockRes();
    (UserService.getUserById as jest.Mock).mockResolvedValue({ id: 1 });
    await UserController.getUserById(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ id: 1 });
  });

  it('getUserById: returns 404 if user not found', async () => {
    const req: any = { params: { userId: '1' } };
    const res = mockRes();
    (UserService.getUserById as jest.Mock).mockResolvedValue(null);
    await UserController.getUserById(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
  });

  it('register: returns 400 if any field is missing', async () => {
    const req: any = {
      body: { firstName: '', lastName: '', email: '', password: '', confirmPassword: '' },
    };
    const res = mockRes();
    await UserController.register(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalled();
  });

  it('register: returns 400 on error', async () => {
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
    (UserService.register as jest.Mock).mockRejectedValue(new Error('fail'));
    await UserController.register(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });
  });

  it('login: returns 400 if email is missing', async () => {
    const req: any = { body: { password: 'pass' } };
    const res = mockRes();
    await UserController.login(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Email is required' });
  });

  it('login: returns 400 if password is missing', async () => {
    const req: any = { body: { email: 'a@b.com' } };
    const res = mockRes();
    await UserController.login(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Password is required' });
  });

  it('login: returns 400 on error', async () => {
    const req: any = { body: { email: 'a@b.com', password: 'pass' } };
    const res = mockRes();
    (UserService.login as jest.Mock).mockRejectedValue(new Error('fail'));
    await UserController.login(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'fail' });
  });

  it('updateUser: returns 401 if no refresh token', async () => {
    const req: any = { body: { firstName: 'A', lastName: 'B', email: 'a@b.com' }, cookies: {} };
    const res = mockRes();
    await UserController.updateUser(req, res);
    expect(res.sendStatus).toHaveBeenCalledWith(401);
  });

  it('logout: returns 204 if no refresh token', async () => {
    const req: any = { cookies: {} };
    const res = mockRes();
    await UserController.logout(req, res);
    expect(res.sendStatus).toHaveBeenCalledWith(204);
    expect(res.clearCookie).not.toHaveBeenCalled();
  });

  it('forgotPassword: returns 400 if email is missing', async () => {
    const req: any = { body: {} };
    const res = mockRes();
    await UserController.forgotPassword(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Email is required' });
  });

  it('resetPassword: returns 400 if token is missing', async () => {
    const req: any = { body: { password: 'Password1', confirmPassword: 'Password1' } };
    const res = mockRes();
    await UserController.resetPassword(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Token is required' });
  });
});
