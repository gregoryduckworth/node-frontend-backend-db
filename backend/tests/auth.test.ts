import request from "supertest";
import app from "../src/app";
import { prisma } from "../prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { setupTestEnv, mockJwtSecrets } from "./utils/testEnv";

// Mock Prisma client
jest.mock("../prisma/client", () => {
  return {
    prisma: {
      user: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    },
  };
});

// Mock JWT
jest.mock("jsonwebtoken", () => {
  return {
    sign: jest.fn().mockReturnValue("mock-token"),
    verify: jest
      .fn()
      .mockReturnValue({ userId: "test-user-id", email: "test@example.com" }),
  };
});

// Mock bcrypt
jest.mock("bcrypt", () => {
  return {
    genSalt: jest.fn().mockResolvedValue("salt"),
    hash: jest.fn().mockResolvedValue("hashed-password"),
    compare: jest.fn(),
  };
});

// Test fixtures
const testUser = {
  id: "user-id",
  firstName: "John",
  lastName: "Doe",
  email: "test@example.com",
  password: "hashed-password",
};

const validPassword = "Password123";
const invalidPassword = "password";
const wrongPassword = "WrongPassword123";

// Helper functions
const setupUserMock = (user: any = null) => {
  (prisma.user.findFirst as jest.Mock).mockResolvedValue(user);
};

const setupPasswordComparison = (isMatch = true) => {
  (bcrypt.compare as jest.Mock).mockResolvedValue(isMatch);
};

describe("Auth Endpoints", () => {
  // Setup environment for tests
  const restoreEnv = setupTestEnv();

  beforeEach(() => {
    jest.clearAllMocks();
    mockJwtSecrets();
  });

  afterAll(() => {
    restoreEnv();
  });

  describe("POST /auth/register", () => {
    const registerEndpoint = "/auth/register";
    const validRegisterData = {
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      password: validPassword,
      confirmPassword: validPassword,
    };

    it("should fail with missing fields", async () => {
      const res = await request(app).post(registerEndpoint).send({});
      expect(res.status).toBe(400);
      expect(res.body.message).toBeDefined();
    });

    it("should fail with password mismatch", async () => {
      const res = await request(app)
        .post(registerEndpoint)
        .send({
          ...validRegisterData,
          confirmPassword: "Password124",
        });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Password doesn't match");
    });

    it("should fail with weak password", async () => {
      const res = await request(app)
        .post(registerEndpoint)
        .send({
          ...validRegisterData,
          password: invalidPassword,
          confirmPassword: invalidPassword,
        });
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Password must contain/);
    });

    it("should fail if email already exists", async () => {
      setupUserMock({ id: "existing-user" });

      const res = await request(app)
        .post(registerEndpoint)
        .send(validRegisterData);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Email already exists");
    });

    it("should succeed with valid data", async () => {
      setupUserMock(null);
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: "new-user-id",
        firstName: validRegisterData.firstName,
        lastName: validRegisterData.lastName,
        email: validRegisterData.email,
      });

      const res = await request(app)
        .post(registerEndpoint)
        .send(validRegisterData);

      expect(res.status).toBe(201);
      expect(res.body.message).toBe("Register Successful");
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          firstName: validRegisterData.firstName,
          lastName: validRegisterData.lastName,
          email: validRegisterData.email,
          password: "hashed-password",
        },
      });
    });
  });

  describe("POST /auth/login", () => {
    const loginEndpoint = "/auth/login";
    const validLoginData = {
      email: testUser.email,
      password: validPassword,
    };

    it("should fail with missing fields", async () => {
      const res = await request(app).post(loginEndpoint).send({});
      expect(res.status).toBe(400);
      expect(res.body.message).toBeDefined();
    });

    it("should fail with non-existent email", async () => {
      setupUserMock(null);

      const res = await request(app).post(loginEndpoint).send({
        email: "nonexistent@example.com",
        password: validPassword,
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Email not found");
    });

    it("should fail with incorrect password", async () => {
      setupUserMock(testUser);
      setupPasswordComparison(false);

      const res = await request(app)
        .post(loginEndpoint)
        .send({
          ...validLoginData,
          password: wrongPassword,
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Password is wrong");
    });

    it("should succeed with valid credentials", async () => {
      setupUserMock(testUser);
      setupPasswordComparison(true);

      const res = await request(app).post(loginEndpoint).send(validLoginData);

      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBeDefined();
      expect(jwt.sign).toHaveBeenCalledTimes(2);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: testUser.id },
        data: { refresh_token: "mock-token" },
      });
    });
  });

  describe("DELETE /auth/logout", () => {
    const logoutEndpoint = "/auth/logout";

    it("should return 204 if not logged in", async () => {
      const res = await request(app).delete(logoutEndpoint);
      expect([200, 204]).toContain(res.status);
    });

    it("should successfully logout when logged in", async () => {
      const mockRequest = request(app)
        .delete(logoutEndpoint)
        .set("Cookie", ["refreshToken=valid-refresh-token"]);
      setupUserMock({
        ...testUser,
        refresh_token: "valid-refresh-token",
      });

      const res = await mockRequest;
      expect(res.status).toBe(200);
      expect(res.body.message).toBe("OK");
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: testUser.id },
        data: { refresh_token: null },
      });
    });
  });

  describe("POST /auth/forgot-password", () => {
    const forgotPasswordEndpoint = "/auth/forgot-password";

    it("should fail with missing email", async () => {
      const res = await request(app).post(forgotPasswordEndpoint).send({});
      expect(res.status).toBe(400);
      expect(res.body.message).toBeDefined();
    });

    it("should return 200 even if email doesn't exist (security)", async () => {
      setupUserMock(null);

      const res = await request(app).post(forgotPasswordEndpoint).send({
        email: "nonexistent@example.com",
      });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe(
        "Password reset instructions sent to your email"
      );
      expect(jwt.sign).not.toHaveBeenCalled();
    });

    it("should generate reset token for existing user", async () => {
      setupUserMock(testUser);

      const res = await request(app).post(forgotPasswordEndpoint).send({
        email: testUser.email,
      });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe(
        "Password reset instructions sent to your email"
      );
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: testUser.id, email: testUser.email },
        expect.any(String),
        { expiresIn: "1h" }
      );
      expect(prisma.user.update).toHaveBeenCalled();
    });
  });

  describe("POST /auth/reset-password", () => {
    const resetPasswordEndpoint = "/auth/reset-password";
    const validToken = "valid-token";
    const newPassword = "NewPassword123";
    const validResetData = {
      token: validToken,
      password: newPassword,
      confirmPassword: newPassword,
    };

    it("should fail with missing fields", async () => {
      const res = await request(app).post(resetPasswordEndpoint).send({});
      expect(res.status).toBe(400);
      expect(res.body.message).toBeDefined();
    });

    it("should fail with password mismatch", async () => {
      const res = await request(app)
        .post(resetPasswordEndpoint)
        .send({
          ...validResetData,
          confirmPassword: "DifferentPassword123",
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Passwords don't match");
    });

    it("should fail with invalid token", async () => {
      (jwt.verify as jest.Mock).mockImplementationOnce(() => {
        throw new Error("Invalid token");
      });

      const res = await request(app)
        .post(resetPasswordEndpoint)
        .send(validResetData);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Invalid or expired token");
    });

    it("should fail if user with token doesn't exist", async () => {
      setupUserMock(null);

      const res = await request(app)
        .post(resetPasswordEndpoint)
        .send(validResetData);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Invalid or expired token");
    });

    it("should successfully reset password with valid token and data", async () => {
      setupUserMock({
        ...testUser,
        reset_token: validToken,
        reset_token_expires: new Date(Date.now() + 3600000),
      });

      const res = await request(app)
        .post(resetPasswordEndpoint)
        .send(validResetData);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Password has been reset successfully");
      expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, "salt");
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: testUser.id },
        data: {
          password: "hashed-password",
          reset_token: null,
          reset_token_expires: null,
        },
      });
    });
  });
});
