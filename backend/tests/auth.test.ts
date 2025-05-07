import request from "supertest";
import app from "../src/app";
import { prisma } from "../prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import {
  testUsers,
  credentials,
  endpoints,
  setupUserMock,
  setupPasswordComparison,
  setupTestSuite,
} from "./helpers";

jest.mock("../prisma/client", () => {
  return {
    prisma: jest.requireActual("./__mocks__/prismaMock").default,
  };
});

jest.mock("jsonwebtoken", () => {
  return jest.requireActual("./__mocks__/jwtMock").default;
});

jest.mock("bcrypt", () => {
  return jest.requireActual("./__mocks__/bcryptMock").default;
});

describe("Auth Endpoints", () => {
  const cleanup = setupTestSuite();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    cleanup();
  });

  describe("POST /auth/register", () => {
    const registerEndpoint = endpoints.auth.register;
    const validRegisterData = {
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      password: credentials.valid.password,
      confirmPassword: credentials.valid.confirmPassword,
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
          password: credentials.invalid.password,
          confirmPassword: credentials.invalid.password,
        });
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(
        /Password must be at least 8 characters long/
      );
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
    const loginEndpoint = endpoints.auth.login;
    const validLoginData = {
      email: testUsers.standard.email,
      password: credentials.valid.password,
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
        password: credentials.valid.password,
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Email not found");
    });

    it("should fail with incorrect password", async () => {
      setupUserMock(testUsers.standard);
      setupPasswordComparison(false);

      const res = await request(app)
        .post(loginEndpoint)
        .send({
          ...validLoginData,
          password: credentials.invalid.password,
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Password is wrong");
    });

    it("should succeed with valid credentials", async () => {
      setupUserMock(testUsers.standard);
      setupPasswordComparison(true);

      const res = await request(app).post(loginEndpoint).send(validLoginData);

      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBeDefined();
      expect(jwt.sign).toHaveBeenCalledTimes(2);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: testUsers.standard.id },
        data: { refresh_token: "mocked-token" },
      });
    });
  });

  describe("DELETE /auth/logout", () => {
    const logoutEndpoint = endpoints.auth.logout;

    it("should return 204 if not logged in", async () => {
      const res = await request(app).delete(logoutEndpoint);
      expect([200, 204]).toContain(res.status);
    });

    it("should successfully logout when logged in", async () => {
      const mockRequest = request(app)
        .delete(logoutEndpoint)
        .set("Cookie", ["refreshToken=valid-refresh-token"]);
      setupUserMock({
        ...testUsers.standard,
        refresh_token: "valid-refresh-token",
      });

      const res = await mockRequest;
      expect(res.status).toBe(200);
      expect(res.body.message).toBe("OK");
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: testUsers.standard.id },
        data: { refresh_token: null },
      });
    });
  });

  describe("POST /auth/forgot-password", () => {
    const forgotPasswordEndpoint = endpoints.auth.forgotPassword;

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
      setupUserMock(testUsers.standard);

      const res = await request(app).post(forgotPasswordEndpoint).send({
        email: testUsers.standard.email,
      });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe(
        "Password reset instructions sent to your email"
      );
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: testUsers.standard.id, email: testUsers.standard.email },
        expect.any(String),
        { expiresIn: "1h" }
      );
      expect(prisma.user.update).toHaveBeenCalled();
    });
  });

  describe("POST /auth/reset-password", () => {
    const resetPasswordEndpoint = endpoints.auth.resetPassword;
    const validToken = "valid-reset-token";
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
        ...testUsers.standard,
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
        where: { id: testUsers.standard.id },
        data: {
          password: "hashed-password",
          reset_token: null,
          reset_token_expires: null,
        },
      });
    });
  });
});
